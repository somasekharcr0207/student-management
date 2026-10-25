from fastapi import FastAPI, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import httpx

from .database import Base, engine, get_db
from .models import Course, Enrollment
from .schemas import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    EnrollmentCreate,
)
from .auth import get_current_user


app = FastAPI(title="Course Management Service")

STUDENT_SERVICE_URL = "http://127.0.0.1:8002"

Base.metadata.create_all(bind=engine)


# Check administrator permissions
def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator permissions required"
        )

    return current_user


# Home endpoint
@app.get("/")
def home():
    return {"message": "Course Management Service is running"}


# Create a course (admin only)
@app.post(
    "/courses",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    existing_course = db.query(Course).filter(
        Course.course_code == course_data.course_code
    ).first()

    if existing_course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A course with this code already exists"
        )

    new_course = Course(**course_data.model_dump())

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


# Retrieve all courses (authenticated users)
@app.get("/courses", response_model=list[CourseResponse])
def get_courses(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Course).all()


# Retrieve one course (authenticated users)
@app.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    return course


# Update a course (admin only)
@app.put("/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    course_data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    duplicate_code = db.query(Course).filter(
        Course.course_code == course_data.course_code,
        Course.id != course_id
    ).first()

    if duplicate_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Another course already uses this course code"
        )

    for key, value in course_data.model_dump().items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)

    return course


# Delete a course (admin only)
@app.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    db.delete(course)
    db.commit()

    return {"message": "Course deleted successfully"}


# Assign a course to a student (admin only)
@app.post("/enrollments", status_code=status.HTTP_201_CREATED)
async def assign_course(
    enrollment_data: EnrollmentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    # Check that the course exists
    course = db.query(Course).filter(
        Course.id == enrollment_data.course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Prevent duplicate assignments
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == enrollment_data.student_id,
        Enrollment.course_id == enrollment_data.course_id
    ).first()

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already enrolled in this course"
        )

    # Verify that the student exists in the Student Service
    authorization = request.headers.get("Authorization")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            student_response = await client.get(
                f"{STUDENT_SERVICE_URL}/students/{enrollment_data.student_id}",
                headers=(
                    {"Authorization": authorization}
                    if authorization
                    else {}
                ),
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Student Service is unavailable"
        )

    if student_response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    if student_response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not verify student with Student Service"
        )

    # Save the enrollment
    enrollment = Enrollment(
        student_id=enrollment_data.student_id,
        course_id=enrollment_data.course_id
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {
        "message": "Course assigned successfully",
        "enrollment_id": enrollment.id,
        "student_id": enrollment.student_id,
        "course_id": enrollment.course_id
    }


# List students enrolled in a course (authenticated users)
@app.get("/courses/{course_id}/enrollments")
def get_course_enrollments(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Check that the course exists
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).all()

    return {
        "course_id": course_id,
        "course_title": course.title,
        "total_students": len(enrollments),
        "student_ids": [
            enrollment.student_id for enrollment in enrollments
        ]
    }

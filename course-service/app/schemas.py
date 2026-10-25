from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    course_code: str = Field(min_length=2, max_length=30)
    department: str = Field(min_length=2, max_length=100)
    instructor: str = Field(min_length=2, max_length=100)
    duration: str = Field(min_length=1, max_length=50)
    fee: float = Field(ge=0)
    description: str | None = None


class CourseUpdate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    course_code: str = Field(min_length=2, max_length=30)
    department: str = Field(min_length=2, max_length=100)
    instructor: str = Field(min_length=2, max_length=100)
    duration: str = Field(min_length=1, max_length=50)
    fee: float = Field(ge=0)
    description: str | None = None


class CourseResponse(BaseModel):
    id: int
    title: str
    course_code: str
    department: str
    instructor: str
    duration: str
    fee: float
    description: str | None

    class Config:
        from_attributes = True
        
        
class EnrollmentCreate(BaseModel):
    student_id: int = Field(gt=0)
    course_id: int = Field(gt=0)        
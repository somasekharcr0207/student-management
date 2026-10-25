from sqlalchemy import Column, Integer, String, Float, Text
from .database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    course_code = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    instructor = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    fee = Column(Float, nullable=False)
    description = Column(Text, nullable=True)


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    course_id = Column(Integer, nullable=False, index=True)

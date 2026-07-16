package com.lms.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "students")
public class Student extends BaseUser {

    public Student() {}

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Column(name = "gender")
    private String gender;

    @Column(name = "highest_qualification")
    private String highestQualification;

    @Column(name = "college")
    private String college;

    @Column(name = "course")
    private String course;

    @Column(name = "department")
    private String department;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "preferred_language")
    private String preferredLanguage;

    @Column(name = "areas_of_interest")
    private String areasOfInterest;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getHighestQualification() { return highestQualification; }
    public void setHighestQualification(String highestQualification) { this.highestQualification = highestQualification; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public String getAreasOfInterest() { return areasOfInterest; }
    public void setAreasOfInterest(String areasOfInterest) { this.areasOfInterest = areasOfInterest; }

    @Column(nullable = false)
    private Long xp = 0L;

    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Column(name = "learning_hours", nullable = false)
    private Double learningHours = 0.0;

    @Column(name = "last_active_date")
    private java.time.LocalDate lastActiveDate;
    @jakarta.persistence.OneToMany(mappedBy = "student", cascade = jakarta.persistence.CascadeType.REMOVE, orphanRemoval = true)
    private java.util.List<QuizAttempt> quizAttempts;

    @jakarta.persistence.OneToMany(mappedBy = "student", cascade = jakarta.persistence.CascadeType.REMOVE, orphanRemoval = true)
    private java.util.List<Enrollment> enrollments;

    @jakarta.persistence.OneToMany(mappedBy = "student", cascade = jakarta.persistence.CascadeType.REMOVE, orphanRemoval = true)
    private java.util.List<AssignmentSubmission> assignmentSubmissions;

    @jakarta.persistence.OneToMany(mappedBy = "student", cascade = jakarta.persistence.CascadeType.REMOVE, orphanRemoval = true)
    private java.util.List<Certificate> certificates;

    public Student(String username, String password, String email, Role role) {
        super(username, password, email, role);
    }

    public Long getXp() { return xp; }
    public void setXp(Long xp) { this.xp = xp; }

    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

    public Double getLearningHours() { return learningHours; }
    public void setLearningHours(Double learningHours) { this.learningHours = learningHours; }

    public java.time.LocalDate getLastActiveDate() { return lastActiveDate; }
    public void setLastActiveDate(java.time.LocalDate lastActiveDate) { this.lastActiveDate = lastActiveDate; }
}

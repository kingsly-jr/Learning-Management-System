package com.lms.backend.dto;

import com.lms.backend.entity.BaseUser;
import com.lms.backend.entity.AdminUser;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String thumbnailUrl;
    private Long studentCount;
    private String joinedOn;

    private String fullName;
    private String phoneNumber;
    private String professionalTitle;
    private String experienceYears;
    private String highestQualification;
    private String skills;
    private String portfolioUrl;
    private String governmentId;
    private String resumeUrl;
    private String interestedCategories;
    private String bio;
    private String preferredLanguage;

    private String dateOfBirth;
    private String gender;
    private String college;
    private String course;
    private String department;
    private String areasOfInterest;

    public UserDTO() {}

    public UserDTO(BaseUser user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole() != null ? user.getRole().getName() : null;
        this.thumbnailUrl = user.getThumbnailUrl();
        this.joinedOn = user.getCreatedAt() != null ? user.getCreatedAt().toString() : null;

        if (user instanceof com.lms.backend.entity.Instructor) {
            com.lms.backend.entity.Instructor inst = (com.lms.backend.entity.Instructor) user;
            this.fullName = inst.getFullName();
            this.phoneNumber = inst.getPhoneNumber();
            this.professionalTitle = inst.getProfessionalTitle();
            this.experienceYears = inst.getExperienceYears();
            this.highestQualification = inst.getHighestQualification();
            this.skills = inst.getSkills();
            this.portfolioUrl = inst.getPortfolioUrl();
            this.governmentId = inst.getGovernmentId();
            this.resumeUrl = inst.getResumeUrl();
            this.interestedCategories = inst.getInterestedCategories();
            this.bio = inst.getBio();
            this.preferredLanguage = inst.getPreferredLanguage();
        } else if (user instanceof com.lms.backend.entity.Student) {
            com.lms.backend.entity.Student student = (com.lms.backend.entity.Student) user;
            this.fullName = student.getFullName();
            this.phoneNumber = student.getPhoneNumber();
            this.dateOfBirth = student.getDateOfBirth();
            this.gender = student.getGender();
            this.highestQualification = student.getHighestQualification();
            this.college = student.getCollege();
            this.course = student.getCourse();
            this.department = student.getDepartment();
            this.bio = student.getBio();
            this.preferredLanguage = student.getPreferredLanguage();
            this.areasOfInterest = student.getAreasOfInterest();
        }
    }

    public UserDTO(AdminUser user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole() != null ? user.getRole().getName() : null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public Long getStudentCount() { return studentCount; }
    public void setStudentCount(Long studentCount) { this.studentCount = studentCount; }

    public String getJoinedOn() { return joinedOn; }
    public void setJoinedOn(String joinedOn) { this.joinedOn = joinedOn; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAreasOfInterest() { return areasOfInterest; }
    public void setAreasOfInterest(String areasOfInterest) { this.areasOfInterest = areasOfInterest; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getProfessionalTitle() { return professionalTitle; }
    public void setProfessionalTitle(String professionalTitle) { this.professionalTitle = professionalTitle; }
    public String getExperienceYears() { return experienceYears; }
    public void setExperienceYears(String experienceYears) { this.experienceYears = experienceYears; }
    public String getHighestQualification() { return highestQualification; }
    public void setHighestQualification(String highestQualification) { this.highestQualification = highestQualification; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public String getGovernmentId() { return governmentId; }
    public void setGovernmentId(String governmentId) { this.governmentId = governmentId; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getInterestedCategories() { return interestedCategories; }
    public void setInterestedCategories(String interestedCategories) { this.interestedCategories = interestedCategories; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
}

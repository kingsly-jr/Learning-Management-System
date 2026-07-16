package com.lms.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "instructors")
public class Instructor extends BaseUser {

    public Instructor() {}

    @jakarta.persistence.OneToMany(mappedBy = "instructor")
    private java.util.List<Course> courses;

    @jakarta.persistence.Column(name = "full_name")
    private String fullName;

    @jakarta.persistence.Column(name = "phone_number")
    private String phoneNumber;

    @jakarta.persistence.Column(name = "professional_title")
    private String professionalTitle;

    @jakarta.persistence.Column(name = "experience_years")
    private String experienceYears;

    @jakarta.persistence.Column(name = "highest_qualification")
    private String highestQualification;

    @jakarta.persistence.Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @jakarta.persistence.Column(name = "portfolio_url")
    private String portfolioUrl;

    @jakarta.persistence.Column(name = "government_id")
    private String governmentId;

    @jakarta.persistence.Column(name = "resume_url")
    private String resumeUrl;

    @jakarta.persistence.Column(name = "interested_categories")
    private String interestedCategories;

    @jakarta.persistence.Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @jakarta.persistence.Column(name = "preferred_language")
    private String preferredLanguage;

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

    public Instructor(String username, String password, String email, Role role) {
        super(username, password, email, role);
    }
}

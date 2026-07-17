package com.lms.backend.dto;

import jakarta.validation.constraints.*;

public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 30, message = "Username must be between 4 and 30 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;

    @NotBlank(message = "Email is required")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$", message = "Please enter a valid @gmail.com email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$", message = "Password must contain uppercase, lowercase, number, and one of @$!%*?&")
    private String password;

    private String role;

    @NotBlank(message = "Full Name is required")
    @Size(min = 3, max = 100, message = "Full Name must be between 3 and 100 characters")
    @Pattern(regexp = "^[A-Za-z\\s\\-']+$", message = "Full Name can only contain letters, spaces, hyphens, and apostrophes")
    private String fullName;

    @NotBlank(message = "Phone Number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone Number must be exactly 10 digits")
    private String phoneNumber;

    @Size(max = 100, message = "Professional Title cannot exceed 100 characters")
    @Pattern(regexp = "^[A-Za-z0-9\\s\\-()]*$", message = "Professional Title contains invalid characters")
    private String professionalTitle;
    
    @Pattern(regexp = "^(0-1|1-3|3-5|5-10|10\\+)?$", message = "Invalid experience years")
    private String experienceYears;
    
    @Pattern(regexp = "^(Diploma|Bachelor's Degree|Master's Degree|M\\.Tech|MCA|MBA|PhD|Other)?$", message = "Invalid highest qualification")
    private String highestQualification;
    
    @Size(max = 1500, message = "Skills cannot exceed 1500 characters")
    private String skills;
    
    @Pattern(regexp = "^(https://.*)?$", message = "Portfolio URL must start with https://")
    private String portfolioUrl;
    
    @Size(max = 30, message = "Government ID cannot exceed 30 characters")
    @Pattern(regexp = "^[A-Za-z0-9]*$", message = "Government ID can only contain letters and numbers")
    private String governmentId;
    
    @Pattern(regexp = "^(https://.*)?$", message = "Resume URL must start with https://")
    private String resumeUrl;
    
    private String interestedCategories;
    
    @Size(max = 300, message = "Bio cannot exceed 300 characters")
    private String bio;
    
    private String preferredLanguage;

    private String dateOfBirth;
    private String gender;
    
    @Size(max = 150, message = "College must not exceed 150 characters")
    @Pattern(regexp = "^[A-Za-z\\s,.\\-'()]*$", message = "College can only contain letters and basic punctuation")
    private String college;
    
    @Size(max = 100, message = "Course must not exceed 100 characters")
    @Pattern(regexp = "^[A-Za-z\\s\\-]*$", message = "Course can only contain letters, spaces, and hyphens")
    private String course;
    
    @Size(max = 100, message = "Department must not exceed 100 characters")
    @Pattern(regexp = "^[A-Za-z\\s\\-]*$", message = "Department can only contain letters, spaces, and hyphens")
    private String department;
    
    private String areasOfInterest;
    
    @Pattern(regexp = "^(https://.*)?$", message = "Thumbnail URL must start with https://")
    private String thumbnailUrl;

    public RegisterRequest() {}

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

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

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

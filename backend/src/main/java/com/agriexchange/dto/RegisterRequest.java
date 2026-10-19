package com.agriexchange.dto;

import com.agriexchange.model.Role;

public class RegisterRequest {
    private String name;
    private String username;
    private String email;
    private String password;
    private Role role;
    private String phone;
    private String mobileNumber;
    private Double landAreaAcres;
    private String organizationName;
    private String address;
    private String district;
    private String state;
    private String pincode;

    public RegisterRequest() {}

    public String getName() { 
        return (name != null && !name.trim().isEmpty()) ? name : username; 
    }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return getName(); }
    public void setUsername(String username) { this.username = username; if (this.name == null) this.name = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPhone() { 
        return (phone != null && !phone.trim().isEmpty()) ? phone : mobileNumber; 
    }
    public void setPhone(String phone) { this.phone = phone; }

    public String getMobileNumber() { return getPhone(); }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; if (this.phone == null) this.phone = mobileNumber; }

    public Double getLandAreaAcres() { return landAreaAcres; }
    public void setLandAreaAcres(Double landAreaAcres) { this.landAreaAcres = landAreaAcres; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
}

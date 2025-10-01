# attendance-tracker
A web-based attendance tracking system with facial recognition and GPS verification.

Setup
Edit js/config.js:

OFFICE_LOCATION: {
    //Your office
    lat: 13.7222904,    //latitude
    lng: 100.5293478    //longitude
}

Usage

For Employees:
Select "Employee"
Enter ID and name
Take photo
Select time period

For Administrators:
Select "Administrator"
Login: admin@gmail.com password: 123456
View reports, export CSV


Features

4 time periods tracking
Facial recognition
GPS verification (200m radius)
Admin dashboard
CSV export


Technical Notes

Data stored in browser LocalStorage (~5-10MB limit)
Session expires after 2 hours
Photos stored as Base64 encoded strings

# HR Service

HR workflow service for time tracking, attendance management, and performance reporting.

## Features

- **Time Tracking:**
  - Clock in/out
  - Break start/end
  - Real-time status tracking
  - Location and device info capture

- **Attendance Management:**
  - Automatic daily attendance calculation
  - Work hours and break hours tracking
  - Attendance status (Present, Absent, Late, Half Day)
  - Team attendance view for supervisors

- **Performance Metrics:**
  - Track various KPIs
  - Performance targets vs actuals
  - Weekly, monthly, quarterly reports
  - Individual and team analytics

## Endpoints

### Time Tracking (All authenticated users)

- `POST /api/time/clock-in` - Clock in
- `POST /api/time/clock-out` - Clock out
- `POST /api/time/break-start` - Start break
- `POST /api/time/break-end` - End break
- `GET /api/time/status` - Get current status
- `GET /api/time/entries` - Get all time entries
- `GET /api/time/entries/range?start={datetime}&end={datetime}` - Get entries in range

### Attendance (All authenticated users)

- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/date/{date}` - Get attendance by date
- `GET /api/attendance/range?startDate={date}&endDate={date}` - Get attendance range
- `GET /api/attendance/team?startDate={date}&endDate={date}` - Get team attendance (Admin/Supervisor)
- `POST /api/attendance/calculate/{date}` - Calculate attendance for date

## Database Schema

**Tables:**
- `time_entries` - All clock in/out and break events
- `attendance_records` - Daily attendance summaries
- `performance_metrics` - Performance tracking data
- `kpi_data` - KPI targets and achievements

## Configuration

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/crm_db
    username: crm_user
    password: crm_password

  data:
    redis:
      host: localhost
      port: 6379

server:
  port: 8082

jwt:
  secret: your-secret-key
  access-token-expiration: 900000      # 15 minutes
  refresh-token-expiration: 604800000  # 7 days
```

## Running the Service

### Prerequisites

1. **User Service must be running** (for authentication tokens)
2. **PostgreSQL and Redis running** via Docker Compose

### Start the service

```bash
cd backend
mvn clean install
cd hr-service
mvn spring-boot:run
```

The service will start on **http://localhost:8082**

### API Documentation

Once running, access Swagger UI at:
**http://localhost:8082/api/swagger-ui.html**

## Usage Examples

### 1. Get JWT Token

First, login via User Service to get a JWT token:

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@demo.com",
    "password": "password123"
  }'
```

Copy the `accessToken` from the response.

### 2. Clock In

```bash
curl -X POST http://localhost:8082/api/time/clock-in \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "LOGIN",
    "locationData": "{\"ip\": \"192.168.1.1\"}",
    "deviceInfo": "{\"browser\": \"Chrome\", \"os\": \"Windows\"}"
  }'
```

### 3. Start Break

```bash
curl -X POST http://localhost:8082/api/time/break-start \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "BREAK_START",
    "notes": "Lunch break"
  }'
```

### 4. End Break

```bash
curl -X POST http://localhost:8082/api/time/break-end \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "BREAK_END"
  }'
```

### 5. Clock Out

```bash
curl -X POST http://localhost:8082/api/time/clock-out \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "LOGOUT"
  }'
```

### 6. Get Current Status

```bash
curl -X GET http://localhost:8082/api/time/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "CLOCKED_IN",
    "latestEntry": {
      "id": "...",
      "entryType": "LOGIN",
      "timestamp": "2026-01-10T09:00:00"
    }
  }
}
```

### 7. Get Today's Attendance

```bash
curl -X GET http://localhost:8082/api/attendance/today \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Calculate Attendance

```bash
curl -X POST http://localhost:8082/api/attendance/calculate/2026-01-10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 9. Get Attendance Range

```bash
curl -X GET "http://localhost:8082/api/attendance/range?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 10. Get Team Attendance (Supervisor/Admin only)

```bash
curl -X GET "http://localhost:8082/api/attendance/team?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Time Entry Flow

1. **Clock In** (`LOGIN`) - Start work day
2. **Start Break** (`BREAK_START`) - Begin break (optional)
3. **End Break** (`BREAK_END`) - Resume work (optional)
4. **Clock Out** (`LOGOUT`) - End work day

**Status States:**
- `CLOCKED_OUT` - Not working
- `CLOCKED_IN` - Currently working
- `ON_BREAK` - On break

## Attendance Calculation

The service automatically calculates:

- **First Login:** First LOGIN entry of the day
- **Last Logout:** Last LOGOUT entry of the day
- **Total Work Hours:** Sum of time between LOGIN/BREAK_START and BREAK_END/LOGOUT
- **Total Break Hours:** Sum of time between BREAK_START and BREAK_END
- **Status:** Determined by:
  - `ABSENT` - No login
  - `LATE` - First login after 9:30 AM
  - `HALF_DAY` - Total work hours < 4
  - `PRESENT` - Normal attendance

## Business Rules

1. **Cannot clock out without clocking in**
2. **Cannot start break without clocking in**
3. **Cannot clock in if already clocked in**
4. **Must end break before clocking out**
5. **Multiple breaks allowed per day**
6. **Attendance calculated based on full day's time entries**

## Role-Based Access

- **All Users:**
  - Can clock in/out for themselves
  - Can start/end breaks
  - Can view own time entries and attendance

- **Admin/Supervisor:**
  - All of the above
  - Can view team attendance
  - Can access team reports

## Performance Considerations

- Time entries indexed by (tenant_id, user_id, timestamp)
- Attendance records indexed by (tenant_id, user_id, date)
- Unique constraint on (tenant_id, user_id, date) for attendance
- Efficient queries for date ranges
- Pagination recommended for large datasets

## Future Enhancements

- Overtime tracking
- Leave management
- Shift scheduling
- Geofencing for location-based clock in
- Mobile app support
- Automated attendance reports via email
- Integration with payroll systems
- Performance review workflows
- Goal setting and tracking

## Dependencies

- Spring Boot 3.2.1
- Spring Security
- Spring Data JPA
- PostgreSQL
- Redis
- Flyway
- iText (PDF generation)
- Apache POI (Excel export)
- SpringDoc OpenAPI

## Troubleshooting

### "You are already clocked in" error
- Check current status: `GET /api/time/status`
- You need to clock out before clocking in again

### "You must clock in first" error
- You need to clock in before starting a break or clocking out

### "You must end your break before clocking out"
- End the current break first: `POST /api/time/break-end`

### Attendance not showing
- Attendance is calculated from time entries
- Use `POST /api/attendance/calculate/{date}` to manually calculate
- Ensure time entries exist for the date

### JWT token expired
- Get a new token from User Service
- Access tokens expire after 15 minutes
- Use refresh token to get a new access token

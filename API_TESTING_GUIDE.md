# API Testing Guide - New Endpoints

## Prerequisites

1. **Get JWT Token**: Login first to get authentication token
```bash
# Login to get JWT token
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr.manager@company.com",
    "password": "your_password"
  }'

# Response will contain:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": {...}
#   }
# }

# Set token as environment variable for easy testing
export JWT_TOKEN="your_jwt_token_here"
```

---

## 1. Holiday Management (NEW)

### Update Holiday
```bash
curl -X PUT http://localhost:8082/api/leave/holidays/{holiday-id} \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Republic Day",
    "date": "2026-01-26",
    "type": "PUBLIC",
    "description": "National Holiday",
    "isOptional": false
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Holiday updated successfully",
#   "data": {
#     "id": "uuid",
#     "name": "Republic Day",
#     "date": "2026-01-26",
#     ...
#   }
# }
```

### Delete Holiday
```bash
curl -X DELETE http://localhost:8082/api/leave/holidays/{holiday-id} \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "message": "Holiday deleted successfully"
# }
```

### Test Scenarios:
- ✅ Update existing holiday
- ✅ Update holiday date (check for conflicts)
- ✅ Try to update holiday from different tenant (should fail)
- ✅ Delete holiday successfully
- ✅ Try to delete non-existent holiday (should fail)

---

## 2. Salary Components CRUD (NEW)

### Get All Components
```bash
curl -X GET http://localhost:8082/api/salary/components \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": [
#     {
#       "id": "uuid",
#       "name": "Basic Salary",
#       "code": "BASIC",
#       "componentType": "EARNING",
#       "calculationType": "PERCENTAGE",
#       "percentage": 50.0,
#       "isTaxable": true,
#       "isFixed": false,
#       "displayOrder": 1
#     },
#     ...
#   ]
# }
```

### Create Component
```bash
curl -X POST http://localhost:8082/api/salary/components \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Special Allowance",
    "code": "SPECIAL_ALLOW",
    "componentType": "EARNING",
    "calculationType": "PERCENTAGE",
    "percentage": 10.0,
    "isTaxable": true,
    "isFixed": false,
    "displayOrder": 5
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Component created successfully",
#   "data": {
#     "id": "uuid",
#     "name": "Special Allowance",
#     ...
#   }
# }
```

### Update Component
```bash
curl -X PUT http://localhost:8082/api/salary/components/{component-id} \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Special Allowance (Updated)",
    "code": "SPECIAL_ALLOW",
    "componentType": "EARNING",
    "calculationType": "PERCENTAGE",
    "percentage": 12.0,
    "isTaxable": true,
    "isFixed": false,
    "displayOrder": 5
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Component updated successfully",
#   "data": {...}
# }
```

### Delete Component
```bash
curl -X DELETE http://localhost:8082/api/salary/components/{component-id} \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "message": "Component deleted successfully"
# }
```

### Test Scenarios:
- ✅ Get all components (should be ordered by displayOrder)
- ✅ Create component with unique code
- ✅ Try to create component with duplicate code (should fail)
- ✅ Update component successfully
- ✅ Update component code (check uniqueness)
- ✅ Try to update component from different tenant (should fail)
- ✅ Delete component successfully
- ⚠️ TODO: Test deleting component in use (should validate)

---

## 3. Document Verification - Enhanced (UPDATED)

### Get Own Documents (Employee)
```bash
curl -X GET http://localhost:8082/api/onboarding/documents \
  -H "Authorization: Bearer $JWT_TOKEN_EMPLOYEE"

# Expected Response:
# {
#   "success": true,
#   "data": [
#     {
#       "id": "uuid",
#       "documentType": "AADHAR",
#       "documentName": "aadhar.pdf",
#       "status": "VERIFIED",
#       ...
#     }
#   ]
# }
```

### Get All Documents - No Filter (HR Admin)
```bash
curl -X GET http://localhost:8082/api/onboarding/documents \
  -H "Authorization: Bearer $JWT_TOKEN_HR"

# Returns all documents for all employees in tenant
```

### Get Documents with Status Filter (HR Admin)
```bash
# Get only pending documents
curl -X GET "http://localhost:8082/api/onboarding/documents?status=PENDING_VERIFICATION" \
  -H "Authorization: Bearer $JWT_TOKEN_HR"

# Get only verified documents
curl -X GET "http://localhost:8082/api/onboarding/documents?status=VERIFIED" \
  -H "Authorization: Bearer $JWT_TOKEN_HR"

# Get only rejected documents
curl -X GET "http://localhost:8082/api/onboarding/documents?status=REJECTED" \
  -H "Authorization: Bearer $JWT_TOKEN_HR"

# Expected Response:
# {
#   "success": true,
#   "data": [
#     {
#       "id": "uuid",
#       "userId": "uuid",
#       "documentType": "PAN_CARD",
#       "status": "PENDING_VERIFICATION",
#       ...
#     },
#     ...
#   ]
# }
```

### Test Scenarios:
- ✅ Employee gets only their own documents (ignores status filter)
- ✅ HR Admin without filter gets all documents
- ✅ HR Admin with status=PENDING_VERIFICATION gets pending documents
- ✅ HR Admin with status=VERIFIED gets verified documents
- ✅ HR Admin with status=REJECTED gets rejected documents
- ✅ Invalid status filter returns empty or all documents

---

## 4. Complete Test Flow Example

### Step 1: Login as HR Manager
```bash
JWT_TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@company.com","password":"password"}' \
  | jq -r '.data.token')

echo "Token: $JWT_TOKEN"
```

### Step 2: Test Holiday Update
```bash
# First, create a holiday to test with
HOLIDAY_RESPONSE=$(curl -s -X POST http://localhost:8082/api/leave/holidays \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Holiday",
    "date": "2026-12-25",
    "type": "PUBLIC",
    "description": "Test",
    "isOptional": false
  }')

HOLIDAY_ID=$(echo $HOLIDAY_RESPONSE | jq -r '.data.id')
echo "Created Holiday ID: $HOLIDAY_ID"

# Now update it
curl -X PUT http://localhost:8082/api/leave/holidays/$HOLIDAY_ID \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Christmas Updated",
    "date": "2026-12-25",
    "type": "PUBLIC",
    "description": "Updated description",
    "isOptional": false
  }' | jq

# Delete it
curl -X DELETE http://localhost:8082/api/leave/holidays/$HOLIDAY_ID \
  -H "Authorization: Bearer $JWT_TOKEN" | jq
```

### Step 3: Test Salary Component CRUD
```bash
# Create component
COMPONENT_RESPONSE=$(curl -s -X POST http://localhost:8082/api/salary/components \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Allowance",
    "code": "TEST_ALLOW",
    "componentType": "EARNING",
    "calculationType": "PERCENTAGE",
    "percentage": 5.0,
    "isTaxable": true,
    "isFixed": false,
    "displayOrder": 10
  }')

COMPONENT_ID=$(echo $COMPONENT_RESPONSE | jq -r '.data.id')
echo "Created Component ID: $COMPONENT_ID"

# Get all components
curl -s -X GET http://localhost:8082/api/salary/components \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# Update component
curl -s -X PUT http://localhost:8082/api/salary/components/$COMPONENT_ID \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Allowance Updated",
    "code": "TEST_ALLOW",
    "componentType": "EARNING",
    "calculationType": "PERCENTAGE",
    "percentage": 7.5,
    "isTaxable": true,
    "isFixed": false,
    "displayOrder": 10
  }' | jq

# Delete component
curl -s -X DELETE http://localhost:8082/api/salary/components/$COMPONENT_ID \
  -H "Authorization: Bearer $JWT_TOKEN" | jq
```

### Step 4: Test Document Filtering
```bash
# Get all documents (HR Admin)
curl -s -X GET http://localhost:8082/api/onboarding/documents \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# Get only pending documents
curl -s -X GET "http://localhost:8082/api/onboarding/documents?status=PENDING_VERIFICATION" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# Get only verified documents
curl -s -X GET "http://localhost:8082/api/onboarding/documents?status=VERIFIED" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq
```

---

## 5. Error Scenarios to Test

### 403 Forbidden (Missing Permission)
```bash
# Try accessing with employee token (should fail)
curl -X GET http://localhost:8082/api/salary/components \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"

# Expected: 403 Forbidden
```

### 404 Not Found
```bash
# Try updating non-existent holiday
curl -X PUT http://localhost:8082/api/leave/holidays/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","date":"2026-01-01","type":"PUBLIC"}'

# Expected: 404 Not Found
```

### 400 Bad Request (Duplicate Code)
```bash
# Create component with code "BASIC" (already exists)
curl -X POST http://localhost:8082/api/salary/components \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Basic",
    "code": "BASIC",
    "componentType": "EARNING"
  }'

# Expected: 400 Bad Request - "Salary component with code 'BASIC' already exists"
```

### 400 Bad Request (Date Conflict)
```bash
# Try to update holiday to a date that already has another holiday
curl -X PUT http://localhost:8082/api/leave/holidays/$HOLIDAY_ID \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "date": "2026-01-26",
    "type": "PUBLIC"
  }'

# Expected: 400 Bad Request - "A holiday already exists on this date"
```

---

## 6. Postman Collection

You can import this as a Postman collection:

```json
{
  "info": {
    "name": "HR Module - New Endpoints",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8082"
    },
    {
      "key": "jwt_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Holidays",
      "item": [
        {
          "name": "Update Holiday",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/leave/holidays/{{holiday_id}}",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Updated Holiday\",\n  \"date\": \"2026-12-25\",\n  \"type\": \"PUBLIC\",\n  \"description\": \"Updated\",\n  \"isOptional\": false\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Delete Holiday",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/leave/holidays/{{holiday_id}}"
          }
        }
      ]
    },
    {
      "name": "Salary Components",
      "item": [
        {
          "name": "Get All Components",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/salary/components"
          }
        },
        {
          "name": "Create Component",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/salary/components",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"New Component\",\n  \"code\": \"NEW_COMP\",\n  \"componentType\": \"EARNING\",\n  \"calculationType\": \"PERCENTAGE\",\n  \"percentage\": 10.0,\n  \"isTaxable\": true,\n  \"isFixed\": false,\n  \"displayOrder\": 5\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Update Component",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/salary/components/{{component_id}}",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Updated Component\",\n  \"code\": \"NEW_COMP\",\n  \"componentType\": \"EARNING\",\n  \"calculationType\": \"PERCENTAGE\",\n  \"percentage\": 12.0,\n  \"isTaxable\": true,\n  \"isFixed\": false,\n  \"displayOrder\": 5\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Delete Component",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/salary/components/{{component_id}}"
          }
        }
      ]
    },
    {
      "name": "Documents",
      "item": [
        {
          "name": "Get All Documents (HR)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/onboarding/documents"
          }
        },
        {
          "name": "Get Pending Documents",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/onboarding/documents?status=PENDING_VERIFICATION"
          }
        },
        {
          "name": "Get Verified Documents",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/onboarding/documents?status=VERIFIED"
          }
        },
        {
          "name": "Get Rejected Documents",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": "{{base_url}}/api/onboarding/documents?status=REJECTED"
          }
        }
      ]
    }
  ]
}
```

---

## 7. Testing Checklist

### Holiday CRUD
- [ ] Update holiday successfully
- [ ] Update holiday with date change (no conflict)
- [ ] Update holiday with date conflict (should fail with 400)
- [ ] Update holiday as non-tenant user (should fail with 400)
- [ ] Delete holiday successfully
- [ ] Delete holiday as non-tenant user (should fail with 400)
- [ ] Delete non-existent holiday (should fail with 404)

### Salary Components CRUD
- [ ] Get all components (ordered by displayOrder)
- [ ] Create component with unique code
- [ ] Create component with duplicate code (should fail with 400)
- [ ] Update component successfully
- [ ] Update component code without conflict
- [ ] Update component code with conflict (should fail with 400)
- [ ] Update component as non-tenant user (should fail with 400)
- [ ] Delete component successfully
- [ ] Delete component as non-tenant user (should fail with 400)
- [ ] Delete non-existent component (should fail with 404)

### Document Verification Enhanced
- [ ] Get own documents as employee (should work)
- [ ] Get all documents as HR admin without filter
- [ ] Get documents with status=PENDING_VERIFICATION as HR
- [ ] Get documents with status=VERIFIED as HR
- [ ] Get documents with status=REJECTED as HR
- [ ] Verify employee with status filter still gets only own documents
- [ ] Verify invalid status doesn't break endpoint

---

## Summary

**7 New Endpoints Ready for Testing:**
1. ✅ PUT `/api/leave/holidays/{id}` - Update holiday
2. ✅ DELETE `/api/leave/holidays/{id}` - Delete holiday
3. ✅ GET `/api/salary/components` - Get all components
4. ✅ POST `/api/salary/components` - Create component
5. ✅ PUT `/api/salary/components/{id}` - Update component
6. ✅ DELETE `/api/salary/components/{id}` - Delete component
7. ✅ GET `/api/onboarding/documents?status=` - Enhanced filtering

All endpoints are secured with `@PreAuthorize("hr:manage")` except document retrieval which has smart role-based behavior.

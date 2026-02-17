"""
Authentication Middleware for RBAC System
Provides JWT token validation and role-based access control
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models

# Security Configuration
SECRET_KEY = "your_super_secret_hospital_key"  # Should match main.py
ALGORITHM = "HS256"

security = HTTPBearer()


class CurrentUser:
    """Data class to hold current authenticated user information"""
    def __init__(self, staff_id: str, role: str, name: str = None):
        self.staff_id = staff_id
        self.role = role
        self.name = name
    
    def has_role(self, allowed_roles: List[str]) -> bool:
        """Check if user has one of the allowed roles"""
        return self.role in allowed_roles


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> CurrentUser:
    """
    Dependency to extract and validate JWT token from request headers.
    Returns CurrentUser object with staff_id and role.
    
    Raises:
        HTTPException 401: If token is invalid or expired
        HTTPException 404: If user not found in database
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        staff_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if staff_id is None or role is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Verify user exists in database
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if staff is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return CurrentUser(staff_id=staff.id, role=staff.role, name=staff.name)


def require_role(allowed_roles: List[str]):
    """
    Dependency factory to create role-based access control.
    
    Usage:
        @app.get("/admin/revenue")
        async def get_revenue(user: CurrentUser = Depends(require_role(["Admin"]))):
            # Only Admin can access this endpoint
            pass
    
    Args:
        allowed_roles: List of role strings that are allowed to access the endpoint
                      Valid values: ["Admin", "Doctor", "Nurse"]
    
    Returns:
        Dependency function that validates user role
        
    Raises:
        HTTPException 403: If user role is not in allowed_roles
    """
    async def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if not current_user.has_role(allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed_roles)}. Your role: {current_user.role}"
            )
        return current_user
    
    return role_checker


# Convenience dependencies for common role combinations
require_admin = require_role(["Admin"])
require_admin_or_doctor = require_role(["Admin", "Doctor"])
require_any_staff = require_role(["Admin", "Doctor", "Nurse"])

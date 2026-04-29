from datetime import datetime, timedelta
from typing import Any, Union
import hashlib
import secrets

from jose import jwt

from .settings import settings

ALGORITHM = "HS256"


def get_password_hash(password: str) -> str:
    """Hash a password using PBKDF2-SHA256"""
    salt_bytes = secrets.token_bytes(32)
    salt_hex = salt_bytes.hex()
    password_bytes = password.encode('utf-8')
    hash_obj = hashlib.pbkdf2_hmac('sha256', password_bytes, salt_bytes, 100000)
    hash_hex = hash_obj.hex()
    return f"{salt_hex}${hash_hex}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        salt_hex, hash_hex = hashed_password.split('$')
        salt_bytes = bytes.fromhex(salt_hex)
        password_bytes = plain_password.encode('utf-8')
        hash_obj = hashlib.pbkdf2_hmac('sha256', password_bytes, salt_bytes, 100000)
        computed_hash = hash_obj.hex()
        return computed_hash == hash_hex
    except (ValueError, AttributeError):
        return False


def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
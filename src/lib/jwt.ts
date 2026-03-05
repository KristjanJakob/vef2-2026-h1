import jwt, { type JwtPayload} from 'jsonwebtoken';

type Role = 'USER' | 'ADMIN';

export type AuthTokenPayload = JwtPayload & {
    sub: string;
    role: Role;
};

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Missing JWT_SECRET');
    }
    return secret;
}
  
const JWT_SECRET = getJwtSecret();
  
export function signToken(payload: { sub: string; role: Role }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
  
export function verifyToken(token: string): AuthTokenPayload {
    const decoded = jwt.verify(token, JWT_SECRET);
  
    if (typeof decoded === 'string') {
      throw new Error('Invalid token payload');
    }

    const role = (decoded as any).role;
    if (role !== 'USER' && role !== 'ADMIN') {
      throw new Error('Invalid token role');
    }
  
    return decoded as AuthTokenPayload;
}
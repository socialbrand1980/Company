# CRM Security & Authentication

## 🔐 Overview

The CRM Analytics dashboard is now **password-protected** to prevent unauthorized access to sensitive lead and revenue data.

## 🚀 Setup

### **1. Set Password**

Create `.env.local` file (or edit existing):

```bash
CRM_PASSWORD=your-secure-password-here
```

**⚠️ IMPORTANT:** Change the default password!

### **2. Default Password**

If `CRM_PASSWORD` is not set, default password is:
```
admin123
```

**Change this immediately in production!**

## 🔑 How to Use

### **Access CRM:**

1. **Visit**: `/crm/analytics`
2. **Redirect** to `/crm/login` automatically
3. **Enter password**
4. **Click** "Access CRM"
5. **Redirect** to analytics dashboard

### **Logout:**

1. **Click** "Logout" button (top right)
2. **Redirect** to login page
3. **Session cleared**

## 🛡️ Security Features

### **Implemented:**
✅ **Password Protection** - Simple password authentication
✅ **Session Management** - 24-hour session cookie
✅ **Protected Routes** - Middleware protects all CRM pages
✅ **HTTP-Only Cookies** - Session not accessible via JavaScript
✅ **Secure in Production** - Cookies only over HTTPS

### **Session Details:**
- **Duration**: 24 hours
- **Storage**: HTTP-only cookie
- **Scope**: Entire `/crm` path
- **Security**: SameSite=strict

## 📁 Protected Routes

These routes require authentication:
- `/crm/analytics` - Main dashboard
- `/crm/leads` - Lead management (if implemented)

Public routes:
- `/crm/login` - Login page (redirects if authenticated)

## 🔧 Configuration

### **Environment Variables:**

```bash
# .env.local
CRM_PASSWORD=MySecurePassword123!
```

### **Production (Vercel):**

1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add `CRM_PASSWORD` with secure value
4. Deploy

## 🚨 Security Recommendations

### **For Production:**

1. **Use Strong Password**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `S0c1alBr@nd!2026#Secure`

2. **Enable HTTPS**
   - Vercel provides HTTPS automatically
   - Never deploy without HTTPS

3. **Regular Password Rotation**
   - Change password every 90 days
   - Use password manager

4. **Limit Access**
   - Share password only with authorized team members
   - Use secure channels (not email/chat)

5. **Monitor Access**
   - Check Vercel function logs regularly
   - Look for suspicious login attempts

### **For Enhanced Security (Future):**

Consider implementing:
- [ ] Multi-factor authentication (MFA)
- [ ] Rate limiting on login endpoint
- [ ] IP whitelisting
- [ ] User accounts with individual credentials
- [ ] Audit logging
- [ ] Session timeout (shorter than 24h)
- [ ] Password complexity requirements

## 📝 Default Credentials

**Default Password** (if not configured):
```
admin123
```

**⚠️ CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!**

## 🔍 Troubleshooting

### **Login Not Working:**

1. **Check Console** (F12) for errors
2. **Verify** password in `.env.local`
3. **Restart** dev server
4. **Clear** browser cookies

### **Redirect Loop:**

1. **Clear** all cookies for domain
2. **Check** middleware.ts configuration
3. **Verify** `/api/auth/login` route exists

### **Session Expires Too Soon:**

- Default is 24 hours
- Check if cookies are being cleared
- Verify browser not in incognito mode

## 📊 Security Audit Log

**Date**: March 8, 2026  
**Implemented By**: AI Assistant  
**Security Level**: Basic Password Protection  
**Session Duration**: 24 hours  
**Cookie Security**: HTTP-only, SameSite=strict  

## 🆘 Emergency Access

If you lose access:

1. **Local Development**:
   - Check `.env.local` file
   - Default: `admin123`

2. **Production (Vercel)**:
   - Check Environment Variables in Vercel dashboard
   - Update `CRM_PASSWORD`
   - Redeploy

## 📚 Additional Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/middleware)
- [Next.js Cookies Docs](https://nextjs.org/docs/cookies)
- [OWASP Authentication Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Remember**: This is basic authentication. For highly sensitive data, consider implementing full user management system with proper authentication provider (NextAuth.js, Clerk, Auth0, etc.).

# The Brick Platform - System Design Documentation

## 1. System Architecture

### 1.1 Technology Stack
- Frontend: Vue.js with TypeScript
- Backend: Supabase (PostgreSQL + Authentication)
- Payment Integration: Mobile Money API
- Hosting: Cloud Platform (TBD)

### 1.2 Core Components
1. **Authentication Service**
   - User registration and verification
   - Email verification system
   - Session management
   - Role-based access control (User, Admin)

2. **Referral Management System**
   - Referral link generation and tracking
   - Referral chain management
   - User displacement algorithm
   - Account status management

3. **Payment Processing**
   - Mobile Money integration
   - Payment distribution system
   - Transaction logging
   - Earnings tracking

4. **Product Advertisement Portal**
   - Business product listings
   - Advertisement management
   - Category organization
   - Search functionality

5. **Raffle System**
   - Automated entry management
   - Prize distribution
   - Winner selection algorithm

## 2. Database Schema

### 2.1 Users Table
```sql
users (
    id: uuid PRIMARY KEY,
    email: text UNIQUE NOT NULL,
    phone: text UNIQUE NOT NULL,
    full_name: text NOT NULL,
    status: text NOT NULL, -- 'pending', 'active', 'deactivated'
    created_at: timestamp DEFAULT now(),
    updated_at: timestamp,
    is_admin: boolean DEFAULT false,
    earnings_total: numeric DEFAULT 0,
    activation_payment_status: text DEFAULT 'pending'
)
```

### 2.2 Referral Links Table
```sql
referral_links (
    id: uuid PRIMARY KEY,
    user_id: uuid REFERENCES users(id),
    code: text UNIQUE NOT NULL,
    usage_count: integer DEFAULT 0,
    max_usage: integer DEFAULT 3,
    status: text DEFAULT 'active',
    created_at: timestamp DEFAULT now()
)
```

### 2.3 Referral Chain Table
```sql
referral_chain (
    id: uuid PRIMARY KEY,
    user_id: uuid REFERENCES users(id),
    beneficiary_id: uuid REFERENCES users(id),
    position: integer NOT NULL, -- 1 to 7
    earnings: numeric DEFAULT 0,
    created_at: timestamp DEFAULT now(),
    UNIQUE(user_id, position)
)
```

### 2.4 Transactions Table
```sql
transactions (
    id: uuid PRIMARY KEY,
    user_id: uuid REFERENCES users(id),
    type: text NOT NULL, -- 'registration', 'referral_earning'
    amount: numeric NOT NULL,
    status: text NOT NULL,
    mobile_money_reference: text,
    created_at: timestamp DEFAULT now()
)
```

### 2.5 Products Table
```sql
products (
    id: uuid PRIMARY KEY,
    business_name: text NOT NULL,
    title: text NOT NULL,
    description: text,
    image_url: text,
    created_at: timestamp DEFAULT now(),
    updated_at: timestamp
)
```

### 2.6 Raffle Entries Table
```sql
raffle_entries (
    id: uuid PRIMARY KEY,
    user_id: uuid REFERENCES users(id),
    draw_date: timestamp NOT NULL,
    status: text DEFAULT 'pending',
    created_at: timestamp DEFAULT now()
)
```

## 3. Key Business Logic

### 3.1 Registration Flow
1. User submits registration form
2. System sends verification email
3. User verifies email
4. User makes payment via Mobile Money
5. System validates payment
6. Account activated and referral links generated

### 3.2 Referral Chain Management
1. New user registers using referral link
2. System validates referral link quota
3. If chain full (7 beneficiaries):
   - Oldest beneficiary removed
   - New user added to chain
4. Earnings distributed to all chain members
5. Chain owner deactivated after earnings completion

### 3.3 Payment Distribution
- Registration fee (UGX 90,000) split:
  - Company: UGX 20,000
  - Each beneficiary (7): UGX 10,000
- Automated distribution via Mobile Money
- Transaction logging and verification

### 3.4 Referral Tree Visualization
- Hierarchical tree structure
- Real-time updates
- Node information:
  - User name
  - Status
  - Earnings
  - Number of direct referrals
- Expandable/collapsible nodes
- Performance optimization for large trees

## 4. Security Measures

### 4.1 Authentication
- Email verification required
- Secure password requirements
- Rate limiting on login attempts
- Session management
- JWT token-based authentication

### 4.2 Data Protection
- Encrypted sensitive data
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

### 4.3 Payment Security
- Secure Mobile Money integration
- Transaction verification
- Payment status monitoring
- Error handling and logging

## 5. Monitoring and Analytics

### 5.1 System Metrics
- User registration rate
- Referral chain completion rate
- Payment success rate
- System performance metrics

### 5.2 Business Metrics
- Total active users
- Revenue generated
- Average chain completion time
- Advertisement engagement rates

## 6. Admin Dashboard

### 6.1 Features
- User management
- Payment monitoring
- Referral chain visualization
- Product advertisement management
- Raffle draw management
- System metrics dashboard

### 6.2 Admin Capabilities
- View all user activities
- Monitor payment distributions
- Manage product listings
- Configure raffle draws
- Generate reports
- System configuration

## 7. Mobile Money Integration

### 7.1 Payment Flow
1. Payment request initiated
2. Mobile Money prompt sent
3. User confirms payment
4. Payment validation
5. Success/failure handling
6. Transaction logging

### 7.2 Error Handling
- Timeout management
- Failed transaction recovery
- Payment verification
- User notification system

## 8. Future Considerations

### 8.1 Scalability
- Database optimization
- Caching implementation
- Load balancing
- Horizontal scaling

### 8.2 Feature Expansion
- Business advertisement dashboard
- Enhanced analytics
- Mobile application
- Additional payment methods
- Improved referral visualization

### 8.3 Performance Optimization
- Database indexing
- Query optimization
- Caching strategies
- Asset optimization

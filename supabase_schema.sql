-- BurnX Production Database Schema

-- 1. Users
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'trainer', 'admin')),
    gender VARCHAR(20),
    age INT,
    weight FLOAT,
    height FLOAT,
    goal VARCHAR(100),
    activity_level VARCHAR(100),
    experience VARCHAR(100),
    equipment VARCHAR(100),
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Trainers (Extended Profile)
CREATE TABLE public.trainers (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    specialty VARCHAR(255),
    experience_years INT,
    rating FLOAT DEFAULT 0.0,
    bio TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Appointments
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for Appointments to allow instant booking notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- 4. Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255),
    amount INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'created' CHECK (status IN ('created', 'success', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AIUsage
CREATE TABLE public.ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    chat_month INT NOT NULL, -- e.g., 0-11 for Jan-Dec
    chat_year INT NOT NULL,
    message_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, chat_month, chat_year)
);

-- 7. WorkoutHistory
CREATE TABLE public.workout_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    workout_name VARCHAR(255) NOT NULL,
    split_name VARCHAR(100),
    duration_mins INT,
    exercises_count INT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for Notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 9. VideoSessions
CREATE TABLE public.video_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    room_name VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_secs INT
);

-- 10. Reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Progress
CREATE TABLE public.progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight FLOAT,
    body_fat_percentage FLOAT,
    calories_consumed INT,
    water_intake_ml INT,
    readiness_score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. MenstrualLogs
CREATE TABLE public.menstrual_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    period_start_date DATE NOT NULL,
    period_end_date DATE,
    cycle_length INT,
    symptoms JSONB,
    mood VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

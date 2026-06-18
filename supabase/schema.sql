-- Specialties
create table specialties (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

-- Doctors
create table doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty_id uuid references specialties(id),
  bio text
);

-- Time Slots (recurring weekly schedule)
create table time_slots (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id),
  day_of_week int,           -- 0=Mon, 6=Sun
  start_time time not null,
  end_time time not null,
  is_active boolean default true
);

-- Appointments
create table appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id),
  patient_name text not null,
  patient_phone text,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'confirmed', -- confirmed/cancelled/rescheduled
  created_at timestamptz default now()
);

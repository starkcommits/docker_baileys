-- Create instances table
CREATE TABLE IF NOT EXISTS instances (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'disconnected',
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create auth_state table for storing authentication credentials
CREATE TABLE IF NOT EXISTS auth_state (
    instance_id VARCHAR(255) PRIMARY KEY REFERENCES instances(id) ON DELETE CASCADE,
    creds TEXT,
    keys TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(255) REFERENCES instances(id) ON DELETE CASCADE,
    message_id VARCHAR(255) NOT NULL,
    remote_jid VARCHAR(255) NOT NULL,
    from_me BOOLEAN DEFAULT false,
    message_type VARCHAR(50),
    content TEXT,
    media_url TEXT,
    timestamp BIGINT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instance_id, message_id)
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(255) REFERENCES instances(id) ON DELETE CASCADE,
    jid VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    notify VARCHAR(255),
    verified_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instance_id, jid)
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(255) REFERENCES instances(id) ON DELETE CASCADE,
    jid VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    description TEXT,
    owner VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instance_id, jid)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_instance_id ON messages(instance_id);
CREATE INDEX IF NOT EXISTS idx_messages_remote_jid ON messages(remote_jid);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_contacts_instance_id ON contacts(instance_id);
CREATE INDEX IF NOT EXISTS idx_groups_instance_id ON groups(instance_id);

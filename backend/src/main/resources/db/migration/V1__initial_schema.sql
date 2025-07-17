-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Teams and Team Management
CREATE TABLE teams (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_owner ON teams(owner_id);

CREATE TABLE team_members (
    team_id UUID NOT NULL REFERENCES teams(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user ON team_members(user_id);

-- OAuth Integration
CREATE TABLE oauth_connections (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_user ON oauth_connections(user_id);
CREATE INDEX idx_oauth_provider ON oauth_connections(provider, provider_user_id);

-- Repositories
CREATE TABLE repositories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    local_path VARCHAR(500) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_analyzed_at TIMESTAMP
);

CREATE INDEX idx_repositories_owner ON repositories(owner_id);
CREATE INDEX idx_repositories_team ON repositories(team_id);
CREATE INDEX idx_repositories_status ON repositories(status);

-- Analysis Runs
CREATE TABLE analysis_runs (
    id UUID PRIMARY KEY,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    error TEXT,
    metrics JSONB
);

CREATE INDEX idx_analysis_runs_repo ON analysis_runs(repository_id);
CREATE INDEX idx_analysis_runs_status ON analysis_runs(status);

-- Code Files
CREATE TABLE code_files (
    id UUID PRIMARY KEY,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    path VARCHAR(1000) NOT NULL,
    language VARCHAR(50) NOT NULL,
    size BIGINT NOT NULL,
    lines_of_code INTEGER NOT NULL,
    complexity DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    churn_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    error_count INTEGER NOT NULL DEFAULT 0,
    last_modified TIMESTAMP
);

CREATE INDEX idx_code_files_repo ON code_files(repository_id);
CREATE INDEX idx_code_files_language ON code_files(language);
CREATE INDEX idx_code_files_path ON code_files(path);

-- Dependencies
CREATE TABLE dependencies (
    id UUID PRIMARY KEY,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    source_file_id UUID REFERENCES code_files(id),
    target_file_id UUID REFERENCES code_files(id),
    source_symbol VARCHAR(500) NOT NULL,
    target_symbol VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    strength INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_dependencies_repo ON dependencies(repository_id);
CREATE INDEX idx_dependencies_source ON dependencies(source_file_id);
CREATE INDEX idx_dependencies_target ON dependencies(target_file_id);

-- Documentation
CREATE TABLE documentation (
    id UUID PRIMARY KEY,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    symbol_id VARCHAR(500) NOT NULL,
    symbol_type VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    usage_notes TEXT,
    examples JSONB,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_documentation_repo ON documentation(repository_id);
CREATE INDEX idx_documentation_symbol ON documentation(symbol_id);
CREATE UNIQUE INDEX idx_documentation_repo_symbol ON documentation(repository_id, symbol_id);

-- Error Tracking
CREATE TABLE error_data (
    id UUID PRIMARY KEY,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    file_id UUID REFERENCES code_files(id),
    message TEXT NOT NULL,
    stack_trace TEXT,
    count INTEGER NOT NULL DEFAULT 1,
    first_occurred TIMESTAMP NOT NULL,
    last_occurred TIMESTAMP NOT NULL,
    severity VARCHAR(50) NOT NULL
);

CREATE INDEX idx_error_data_repo ON error_data(repository_id);
CREATE INDEX idx_error_data_file ON error_data(file_id);
CREATE INDEX idx_error_data_severity ON error_data(severity);

-- Audit Logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
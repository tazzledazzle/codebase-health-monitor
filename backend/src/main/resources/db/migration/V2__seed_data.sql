-- Seed Users
INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'Admin User', '$2a$10$8K1p/a6O2Oy3iL9g.6kvpOiPUj6IvBIEfMv4S1I1XPEIFNzE7kfVe', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'dev@example.com', 'Developer User', '$2a$10$8K1p/a6O2Oy3iL9g.6kvpOiPUj6IvBIEfMv4S1I1XPEIFNzE7kfVe', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'test@example.com', 'Test User', '$2a$10$8K1p/a6O2Oy3iL9g.6kvpOiPUj6IvBIEfMv4S1I1XPEIFNzE7kfVe', NOW(), NOW());

-- Seed Teams
INSERT INTO teams (id, name, owner_id, created_at, updated_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Engineering Team', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'QA Team', '11111111-1111-1111-1111-111111111111', NOW(), NOW());

-- Seed Team Members
INSERT INTO team_members (team_id, user_id, role, joined_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'ADMIN', NOW()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'MEMBER', NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'ADMIN', NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'MEMBER', NOW());

-- Seed Repositories
INSERT INTO repositories (id, name, url, local_path, owner_id, team_id, status, created_at, updated_at)
VALUES 
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sample Kotlin Project', 'https://github.com/example/kotlin-project', '/tmp/repos/kotlin-project', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'READY', NOW(), NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Sample TypeScript Project', 'https://github.com/example/typescript-project', '/tmp/repos/typescript-project', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'READY', NOW(), NOW());

-- Seed Analysis Runs
INSERT INTO analysis_runs (id, repository_id, started_at, completed_at, status, metrics)
VALUES 
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'COMPLETED', '{"linesOfCode": 1500, "numberOfFiles": 25, "numberOfClasses": 15, "numberOfFunctions": 75, "averageComplexity": 2.3, "dependencyCount": 35, "fileTypeDistribution": {"kt": 20, "kts": 5}, "errorCount": 0, "testCoverage": 78.5}'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 23 hours', 'COMPLETED', '{"linesOfCode": 2200, "numberOfFiles": 40, "numberOfClasses": 22, "numberOfFunctions": 120, "averageComplexity": 2.1, "dependencyCount": 50, "fileTypeDistribution": {"ts": 35, "tsx": 5}, "errorCount": 3, "testCoverage": 65.2}');

-- Seed Code Files (just a few examples)
INSERT INTO code_files (id, repository_id, path, language, size, lines_of_code, complexity, last_modified)
VALUES 
    ('aaaabbbb-aaaa-bbbb-aaaa-bbbbaaaabbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'src/main/kotlin/com/example/Application.kt', 'kotlin', 2048, 75, 1.5, NOW() - INTERVAL '5 days'),
    ('bbbbcccc-bbbb-cccc-bbbb-ccccbbbbcccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'src/main/kotlin/com/example/service/UserService.kt', 'kotlin', 4096, 150, 2.8, NOW() - INTERVAL '3 days'),
    ('ccccdddd-cccc-dddd-cccc-ddddccccdddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'src/components/App.tsx', 'typescript', 3072, 120, 1.8, NOW() - INTERVAL '4 days'),
    ('ddddeeee-dddd-eeee-dddd-eeeeddddeeee', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'src/services/api.ts', 'typescript', 5120, 200, 2.5, NOW() - INTERVAL '2 days');

-- Seed Dependencies
INSERT INTO dependencies (id, repository_id, source_file_id, target_file_id, source_symbol, target_symbol, type)
VALUES 
    ('aabbccdd-aabb-ccdd-aabb-ccddaabbccdd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaabbbb-aaaa-bbbb-aaaa-bbbbaaaabbbb', 'bbbbcccc-bbbb-cccc-bbbb-ccccbbbbcccc', 'Application', 'UserService', 'IMPORT'),
    ('bbccddee-bbcc-ddee-bbcc-ddeeddeebbcc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ccccdddd-cccc-dddd-cccc-ddddccccdddd', 'ddddeeee-dddd-eeee-dddd-eeeeddddeeee', 'App', 'ApiService', 'IMPORT');

-- Seed Documentation
INSERT INTO documentation (id, repository_id, symbol_id, symbol_type, name, description, usage_notes, examples, generated_at, version)
VALUES 
    ('abcdef12-abcd-ef12-abcd-ef12abcdef12', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'com.example.service.UserService', 'CLASS', 'UserService', 'Service class for managing user operations', 'Inject this service to handle user authentication and profile management', '["val userService = UserService()", "userService.authenticate(email, password)"]', NOW(), 1),
    ('bcdef123-bcde-f123-bcde-f123bcdef123', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ApiService', 'CLASS', 'ApiService', 'Service for making API calls', 'Import and use this service for all backend communication', '["import { ApiService } from ''./services/api''", "ApiService.fetchData()"]', NOW(), 1);

-- Seed Error Data
INSERT INTO error_data (id, repository_id, file_id, message, stack_trace, count, first_occurred, last_occurred, severity)
VALUES 
    ('11223344-1122-3344-1122-334411223344', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ddddeeee-dddd-eeee-dddd-eeeeddddeeee', 'TypeError: Cannot read property ''data'' of undefined', 'at ApiService.processResponse (/src/services/api.ts:45:23)\nat async ApiService.fetchData (/src/services/api.ts:30:12)', 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'ERROR'),
    ('22334455-2233-4455-2233-445522334455', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ccccdddd-cccc-dddd-cccc-ddddccccdddd', 'React Error: Maximum update depth exceeded', 'at App (/src/components/App.tsx:28:15)\nat useState callback', 1, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', 'WARNING');

-- Seed Audit Logs
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
VALUES 
    ('a1b2c3d4-a1b2-c3d4-a1b2-c3d4a1b2c3d4', '11111111-1111-1111-1111-111111111111', 'REPOSITORY_ADDED', 'REPOSITORY', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '{"name": "Sample Kotlin Project", "url": "https://github.com/example/kotlin-project"}', '192.168.1.100', NOW() - INTERVAL '3 days'),
    ('b2c3d4e5-b2c3-d4e5-b2c3-d4e5b2c3d4e5', '22222222-2222-2222-2222-222222222222', 'REPOSITORY_ADDED', 'REPOSITORY', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '{"name": "Sample TypeScript Project", "url": "https://github.com/example/typescript-project"}', '192.168.1.101', NOW() - INTERVAL '4 days'),
    ('c3d4e5f6-c3d4-e5f6-c3d4-e5f6c3d4e5f6', '11111111-1111-1111-1111-111111111111', 'USER_ADDED_TO_TEAM', 'TEAM_MEMBER', NULL, '{"teamId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "userId": "22222222-2222-2222-2222-222222222222", "role": "MEMBER"}', '192.168.1.100', NOW() - INTERVAL '5 days');
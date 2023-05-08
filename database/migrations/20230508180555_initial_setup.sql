-- +goose Up
-- +goose StatementBegin
CREATE TABLE Webhooks.HookEventTypes (
    Id INTEGER AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL,

    PRIMARY KEY(Id)
);
-- +goose StatementEnd
-- +goose StatementBegin
CREATE TABLE Webhooks.Hooks (
    Id INT AUTO_INCREMENT,
    EventType INTEGER NOT NULL,
    Url VARCHAR(255) NOT NULL,
    RowInserted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY(id),

    CONSTRAINT fk_webhook_event
    FOREIGN KEY (EventType) 
    REFERENCES HookEventTypes(Id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS Webhooks.Hooks;
-- +goose StatementEnd
-- +goose StatementBegin
DROP TABLE IF EXISTS Webhooks.HookEventTypes;
-- +goose StatementEnd

-- -----------
-- Cleanup and Reset
-- -----------
DROP TABLE IF EXISTS Webhooks.Hooks;
DROP TABLE IF EXISTS Webhooks.HookEventTypes;

-- -----------
-- Create Tables
-- -----------
CREATE TABLE Webhooks.HookEventTypes (
    Id INTEGER AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL,

    PRIMARY KEY(Id)
);

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

-- -----------
-- Seed Base Data
-- -----------
INSERT INTO Webhooks.HookEventTypes (Id, Name)
VALUES
    (1, 'CHECKOUT'),
    (2, 'SUBSCRIPTION'),
    (3, 'PAYMENT_COMPLETE');


INSERT INTO Webhooks.Hooks (Id, EventType, Url)
VALUES
    (1, 1, 'https://jsonplaceholder.typicode.com/posts');
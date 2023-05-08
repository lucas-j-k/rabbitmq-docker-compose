-- +goose Up
-- +goose StatementBegin
INSERT INTO Webhooks.HookEventTypes (Id, Name)
VALUES
    (1, 'CHECKOUT'),
    (2, 'SUBSCRIPTION'),
    (3, 'PAYMENT_COMPLETE');
-- +goose StatementEnd

-- +goose StatementBegin
INSERT INTO Webhooks.Hooks (EventType, Url)
VALUES
    (1, 'https://jsonplaceholder.typicode.com/posts'),
    (1, 'https://jsonplaceholder.typicode.com/posts'),
    (2, 'https://jsonplaceholder.typicode.com/posts'),
    (3, 'https://jsonplaceholder.typicode.com/posts');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM Webhooks.Hooks;
-- +goose StatementEnd

-- +goose StatementBegin
DELETE FROM Webhooks.HookEventTypes;
-- +goose StatementEnd

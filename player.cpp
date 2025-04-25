#include "player.h"
#include "utils.h"

Player::Player() : x((SCREEN_WIDTH - 50) / 2.0f), y(500.0f), speed(300.0f), health(3) {
    rect.w = 50;
    rect.h = 50;
    rect.x = static_cast<int>(x);
    rect.y = static_cast<int>(y);
}

void Player::update(float deltaTime) {
    const Uint8* keyState = SDL_GetKeyboardState(NULL);
    float moveX = 0.0f, moveY = 0.0f;
    if (keyState[SDL_SCANCODE_W]) moveY -= speed * deltaTime;
    if (keyState[SDL_SCANCODE_S]) moveY += speed * deltaTime;
    if (keyState[SDL_SCANCODE_A]) moveX -= speed * deltaTime;
    if (keyState[SDL_SCANCODE_D]) moveX += speed * deltaTime;

    x += moveX;
    y += moveY;
    if (x < 0) x = 0;
    if (x > SCREEN_WIDTH - rect.w) x = SCREEN_WIDTH - rect.w;
    if (y < 0) y = 0;
    if (y > SCREEN_HEIGHT - rect.h) y = SCREEN_HEIGHT - rect.h;

    rect.x = static_cast<int>(x);
    rect.y = static_cast<int>(y);
}

void Player::render(SDL_Renderer* renderer) {
    SDL_RenderCopy(renderer, LoadTexture("spaceship.png", renderer), NULL, &rect);
}
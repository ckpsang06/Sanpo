#include "game.h"
#include "utils.h"
#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>

const int SCREEN_WIDTH = 800;
const int SCREEN_HEIGHT = 600;

Game::Game() : running(true), score(0), lastEnemySpawnTime(0), enemySpawnCooldown(1000) {
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        std::cout << "Không khởi tạo được SDL! Lỗi: " << SDL_GetError() << std::endl;
        running = false;
        return;
    }
    if (TTF_Init() < 0) {
        std::cout << "Không khởi tạo được SDL_ttf! Lỗi: " << TTF_GetError() << std::endl;
        running = false;
        return;
    }

    window = SDL_CreateWindow("Space Shooter", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, SCREEN_WIDTH, SCREEN_HEIGHT, SDL_WINDOW_SHOWN);
    if (!window) {
        std::cout << "Không tạo được cửa sổ! Lỗi: " << SDL_GetError() << std::endl;
        running = false;
        return;
    }

    renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);
    if (!renderer) {
        std::cout << "Không tạo được renderer! Lỗi: " << SDL_GetError() << std::endl;
        running = false;
        return;
    }

    font = TTF_OpenFont("assets/OpenSans-Regular.ttf", 24);
    if (!font) {
        std::cout << "Không load được font! Lỗi: " << TTF_GetError() << std::endl;
        running = false;
        return;
    }

    playerTexture = LoadTexture("assets/player.png", renderer);
    enemyTexture = LoadTexture("assets/enemy.png", renderer);
    bulletTexture = LoadTexture("assets/bullet.png", renderer);
    explosionTexture = LoadTexture("assets/explosion.png", renderer);

    if (!playerTexture || !enemyTexture || !bulletTexture || !explosionTexture) {
        running = false;
        return;
    }

    player = Player(SCREEN_WIDTH / 2 - 30, SCREEN_HEIGHT - 100, 300.0f);
    srand(static_cast<unsigned>(time(0)));
}

Game::~Game() {
    SDL_DestroyTexture(playerTexture);
    SDL_DestroyTexture(enemyTexture);
    SDL_DestroyTexture(bulletTexture);
    SDL_DestroyTexture(explosionTexture);
    TTF_CloseFont(font);
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    TTF_Quit();
    SDL_Quit();
}

void Game::update(float deltaTime) {
    Uint32 currentTime = SDL_GetTicks();

    // Update player
    player.update(deltaTime);

    // Spawn enemies
    if (currentTime - lastEnemySpawnTime >= enemySpawnCooldown) {
        int x = rand() % (SCREEN_WIDTH - 60);
        MoveType moveType = (rand() % 2 == 0) ? STRAIGHT : ZIGZAG;
        enemies.emplace_back(x, -60, 100.0f, moveType, currentTime);
        lastEnemySpawnTime = currentTime;
    }

    // Update enemies
    for (auto it = enemies.begin(); it != enemies.end();) {
        it->update(deltaTime, currentTime);
        if (it->getRect().y > SCREEN_HEIGHT) {
            it = enemies.erase(it);
        } else {
            ++it;
        }
    }

    // Update bullets
    for (auto it = bullets.begin(); it != bullets.end();) {
        it->update(deltaTime);
        if (it->getRect().y < 0) {
            it = bullets.erase(it);
        } else {
            ++it;
        }
    }

    // Update explosions
    for (auto it = explosions.begin(); it != explosions.end();) {
        it->update(currentTime);
        if (!it->isActive()) {
            it = explosions.erase(it);
        } else {
            ++it;
        }
    }

    // Handle collisions
    for (auto bulletIt = bullets.begin(); bulletIt != bullets.end();) {
        bool bulletHit = false;
        for (auto enemyIt = enemies.begin(); enemyIt != enemies.end() && !bulletHit;) {
            if (checkCollision(bulletIt->getRect(), enemyIt->getRect())) {
                explosions.emplace_back(enemyIt->getRect().x + enemyIt->getRect().w / 2, enemyIt->getRect().y + enemyIt->getRect().h / 2);
                enemyIt = enemies.erase(enemyIt);
                bulletIt = bullets.erase(bulletIt);
                score += 10;
                bulletHit = true;
            } else {
                ++enemyIt;
            }
        }
        if (!bulletHit) {
            ++bulletIt;
        }
    }
}

void Game::render() {
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
    SDL_RenderClear(renderer);

    player.render(renderer, playerTexture);
    for (auto& enemy : enemies) {
        enemy.render(renderer, enemyTexture);
    }
    for (auto& bullet : bullets) {
        bullet.render(renderer, bulletTexture);
    }
    for (auto& explosion : explosions) {
        explosion.render(renderer, explosionTexture);
    }

    SDL_Color white = {255, 255, 255, 255};
    SDL_Texture* scoreTexture = RenderText("Score: " + std::to_string(score), font, white, renderer);
    if (scoreTexture) {
        int texW, texH;
        SDL_QueryTexture(scoreTexture, NULL, NULL, &texW, &texH);
        SDL_Rect scoreRect = {10, 10, texW, texH};
        SDL_RenderCopy(renderer, scoreTexture, NULL, &scoreRect);
        SDL_DestroyTexture(scoreTexture);
    }

    SDL_RenderPresent(renderer);
}

void Game::handleEvents() {
    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        if (event.type == SDL_QUIT) {
            running = false;
        } else if (event.type == SDL_KEYDOWN) {
            if (event.key.keysym.sym == SDLK_SPACE) {
                SDL_Rect playerRect = player.getRect();
                bullets.emplace_back(playerRect.x + playerRect.w / 2 - 5, playerRect.y, 500.0f);
            }
        }
    }
}

bool Game::isRunning() const {
    return running;
}
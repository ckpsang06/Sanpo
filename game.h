#ifndef GAME_H
#define GAME_H

#include <SDL2/SDL.h>
#include <SDL2/SDL_image.h>
#include <SDL2/SDL_mixer.h>
#include <SDL2/SDL_ttf.h>
#include <vector>
#include "player.h"
#include "enemy.h"
#include "bullet.h"
#include "explosion.h"

const int SCREEN_WIDTH = 800;
const int SCREEN_HEIGHT = 600;
const int FPS = 60;

enum GameState { MENU, PLAY, GAME_OVER, HELP };

class Game {
public:
    Game();
    bool init();
    void run();
    void cleanup();

private:
    void handleEvents();
    void update(float deltaTime);
    void render();

    SDL_Window* window;
    SDL_Renderer* renderer;
    bool quit;
    GameState currentState;
    int score;
    int playerHealth;
    Uint32 startTime;
    Player player;
    std::vector<Enemy> enemies;
    std::vector<Bullet> bullets;
    std::vector<Explosion> explosions;
    SDL_Texture* playerTexture;
    SDL_Texture* enemyTexture;
    SDL_Texture* bulletTexture;
    SDL_Texture* explosionTexture;
    Mix_Chunk* shootSound;
    Mix_Chunk* hitSound;
    Mix_Chunk* explosionSound;
    TTF_Font* font;
    Uint32 lastBulletTime;
    Uint32 lastEnemySpawnTime;
    const Uint32 bulletCooldown = 500;
    const Uint32 enemySpawnCooldown = 2000;
};

#endif
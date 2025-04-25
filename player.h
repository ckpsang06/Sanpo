#ifndef PLAYER_H
#define PLAYER_H

#include <SDL2/SDL.h>

class Player {
public:
    Player();
    void update(float deltaTime);
    void render(SDL_Renderer* renderer);
    SDL_Rect getRect() const { return rect; }
    int getHealth() const { return health; }
    void decreaseHealth() { health--; }

private:
    SDL_Rect rect;
    float x, y;
    float speed;
    int health;
};

#endif
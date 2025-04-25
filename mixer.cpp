#include <SDL.h>
#include <SDL_mixer.h>
#include <iostream>
using namespace std;

int main() {
    SDL_Init(SDL_INIT_AUDIO);
    if (Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT, 2, 2048) < 0) {
        cout << "Lỗi: " << Mix_GetError() << endl;
        return 1;
    }
    Mix_Chunk* sound = Mix_LoadWAV("explosion.wav");
    if (!sound) {
        cout << "Lỗi tải: " << Mix_GetError() << endl;
        return 1;
    }
    Mix_PlayChannel(-1, sound, 0);
    SDL_Delay(2000); // Chờ 2 giây để nghe
    Mix_FreeChunk(sound);
    Mix_CloseAudio();
    SDL_Quit();
    return 0;
}
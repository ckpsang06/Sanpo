#include <SDL2/SDL.h>
#include <SDL2/SDL_image.h>
#include <SDL2/SDL_mixer.h>
#include <SDL2/SDL_ttf.h>
#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <cstdlib> // để dùng rand()
#include <ctime>   // để dùng time()
using namespace std;

const int SCREEN_WIDTH = 800;
const int SCREEN_HEIGHT = 600;
const int FPS=60;

// Hàm load texture
SDL_Texture* LoadTexture(const string &file, SDL_Renderer* renderer) {
    SDL_Surface* surface = IMG_Load(file.c_str());
    if (!surface) {
        cout << "Không load được ảnh: " << file << " | Lỗi: " << IMG_GetError() << endl;
        return nullptr;
    }
    SDL_SetColorKey(surface, SDL_TRUE, SDL_MapRGB(surface->format, 255, 255, 255));
    
    SDL_Texture* texture = SDL_CreateTextureFromSurface(renderer, surface);
    SDL_FreeSurface(surface);
    return texture;
}

//Hàm render text
SDL_Texture* RenderText(const string &message, TTF_Font* font, SDL_Color color, SDL_Renderer* renderer){
    SDL_Surface* surf=TTF_RenderText_Solid(font,message.c_str(),color);
    if(!surf){
        cout<<"Không tạo được surface! Lỗi: "<<TTF_GetError()<<endl;
        return nullptr;
    }
    SDL_Texture* texture=SDL_CreateTextureFromSurface(renderer,surf);
    SDL_FreeSurface(surf);
    return texture;
}

struct Bullet {
    SDL_Rect rect;
    float speed;
    int startY; // Lưu vị trí ban đầu của viên đạn
};

enum MoveType{STRAIGHT,ZIGZAG}; // kiểu di chuyển của enemy
// cấu trúc enemy
struct Enemy {
    SDL_Rect rect;
    float speed;  // tốc độ di chuyển trục Y
    int initialX; // Vị trí X ban đầu, dùng cho chuyển động ziczac
    Uint32 spawnTime; // thời gian spawn, dùng cho chuyển động ziczac
    MoveType moveType; // kiểu di chuyển: STRAIGHT hoặc ZIGZAG
};

// hàm kiểm tra va chạm giữa 2 hình chữ nhật
bool checkCollision ( const SDL_Rect &a, const SDL_Rect &b){
    return (a.x +a.w > b.x) && (a.x < b.x + b.w) &&
     (a.y + a.h > b.y ) && (a.y < b.y + b.h); 
}

struct Explosion {
    SDL_Rect expRect;
    int frame;
    int maxFrames;
    Uint32 startTime;
    Uint32 frameDuration;
    bool isActive;
};

// Enum trạng thái game
enum GameState{ MENU,PLAY,GAME_OVER,HELP };

// *Thêm biến cooldown*
Uint32 lastBulletTime = 0; // Lưu thời gian bắn viên đạn cuối cùng
const Uint32 bulletCooldown = 500; // 500ms (2 viên đạn mỗi giây)

// biến cooldown của enemy spawn
Uint32 lastEnemySpawnTime = 0; // lưu thời gia spawn enemy cuối cùng
const Uint32 enemySpawnCooldown = 2000; // 1 enemy mỗi 2 giây

int main(int argc, char* argv[]) {
    srand(static_cast<unsigned int>(time(0))); // khởi tạo seed cho rand()

    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        cout << "SDL không khởi tạo được! Lỗi: " << SDL_GetError() << endl;
        return 1;
    }

     // Khởi tạo SDL_image
     if ((IMG_Init(IMG_INIT_PNG) & IMG_INIT_PNG) != IMG_INIT_PNG) {
        cout << "Không khởi tạo được SDL_image! Lỗi: " << IMG_GetError() << endl;
        SDL_Quit();
        return 1;
    }

    // Khởi tạo SDL_mixer
    if(Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT,2, 2048)<0){
        cout<<"Không khởi tạo được SDL_mixer! Lỗi: "<<Mix_GetError()<<endl;
        SDL_Quit();
        return 1;
    }

    // Khởi tạo SDL_ttf
    if(TTF_Init()==-1){
        cout<<"KhÔng khởi tạo được SDL_ttf! Lỗi: "<<TTF_GetError()<<endl;
        SDL_Quit();
        return 1;
    }

    SDL_Window* window = SDL_CreateWindow("Spaceship",
                                          SDL_WINDOWPOS_CENTERED,
                                          SDL_WINDOWPOS_CENTERED,
                                          SCREEN_WIDTH, SCREEN_HEIGHT,
                                          SDL_WINDOW_SHOWN);
    if (window == nullptr) {
        cout << "Không tạo được cửa sổ! Lỗi: " << SDL_GetError() << endl;
        SDL_Quit();
        return 1;
    }

    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    if (renderer == nullptr) {
        cout << "Không tạo được renderer! Lỗi: " << SDL_GetError() << endl;
        SDL_DestroyWindow(window);
        Mix_CloseAudio();
        SDL_Quit();
        return 1;
    }

    // Load ảnh phi thuyền
    SDL_Texture* playerTexture = LoadTexture("spaceship.png", renderer);
    if (!playerTexture) {
        // Nếu thất bại, ta dừng
        SDL_DestroyRenderer(renderer);
        SDL_DestroyWindow(window);
        Mix_CloseAudio();
        IMG_Quit();
        SDL_Quit();
        return 1;
    }

    // Load sprite sheet hiệu ứng nổ
    SDL_Texture* explosionTexture=LoadTexture("explosion.png",renderer);
    if(!explosionTexture){
        cout<<"Không tải được explosion.png! Lỗi: "<<IMG_GetError()<<endl;
        SDL_DestroyTexture(playerTexture);
        SDL_DestroyRenderer(renderer);
        SDL_DestroyWindow(window);
        Mix_CloseAudio();
        IMG_Quit();
        SDL_Quit();
        return 1;
    } 
    
    // Load ảnh enemy
    SDL_Texture* enemyTexture = LoadTexture("enemy.png", renderer);
    if (!enemyTexture) {
        cout << "Không tải được enemy.png! Lỗi: " << IMG_GetError() << endl;
        SDL_DestroyTexture(playerTexture);
        SDL_DestroyTexture(explosionTexture);
        SDL_DestroyRenderer(renderer);
        SDL_DestroyWindow(window);
        Mix_CloseAudio();
        TTF_Quit();
        IMG_Quit();
        SDL_Quit();
        return 1;
    }

    //tải ảnh bullet
    SDL_Texture* bulletTexture = LoadTexture("bullet.png", renderer);
    if (!bulletTexture) {
        cout << "Không tải được bullet.png! Lỗi: " << IMG_GetError() << endl;
        return 1;
}

    //Tải âm thanh
    Mix_Chunk* shootSound = Mix_LoadWAV("shoot.wav");
    if(!shootSound){ cout<<"Không tải được shoot.wav! Lỗi: "<<Mix_GetError()<<endl;}
    else{ 
        Mix_VolumeChunk(shootSound, MIX_MAX_VOLUME); 
        cout<<"Tải thành công shoot.wav!"<<endl;
    }
    Mix_Chunk* hitsound = Mix_LoadWAV("hit.wav");
    if(!hitsound){ cout<<"Không tải được hit.wav! Lỗi: "<<Mix_GetError()<<endl;}
    else{ 
        Mix_VolumeChunk(hitsound, MIX_MAX_VOLUME); 
        cout<<"Tải thành công hit.wav!"<<endl;
    }
    Mix_Chunk* explosionSound = Mix_LoadWAV("explosion.wav");
    if(!explosionSound){ cout <<"Không load được explosion.wav! Lỗi: "<<Mix_GetError()<<endl;}
    else{ 
        Mix_VolumeChunk(explosionSound, MIX_MAX_VOLUME); 
        cout<<"Tải thành công explosion.wav!"<<endl;
    }

    // Tải font và render text
    TTF_Font* font=TTF_OpenFont("arial.ttf",24);
    if(!font){
        cout<<"Không tải được font! Lỗi: "<<TTF_GetError()<<endl;
        SDL_DestroyTexture(playerTexture);
        SDL_DestroyRenderer(renderer);
        SDL_DestroyWindow(window);
        Mix_CloseAudio();
        IMG_Quit();
        SDL_Quit();
        return 1;
    }
    
    // Nhân vật
    // Sử dụng float cho vị trí phi thuyền
    float playerX = (SCREEN_WIDTH - 50) / 2.0f;
    float playerY = 500.0f;
    SDL_Rect playerRect;
    playerRect.w = 50;
    playerRect.h = 50;
    playerRect.x = (SCREEN_WIDTH - playerRect.w) / 2;
    playerRect.y = 500;
    const float playerSpeed=300.0f; // tốc độ di chuyển của nhân vật: 300 pixel/giây
    int playerHealth = 3;

    // Danh sách đạn và enemy
    vector<Bullet> bullets;
    vector<Enemy> enemies;
    const float bulletSpeed = 500.0f; 
    const int bulletWidth = 10, bulletHeight = 20;
    const int enemyWidth = 60, enemyHeight = 60;
    const float enemySpeed = 150.0f;

    // vector lưu hiệu ứng nổ
    vector<Explosion> explosions;

    bool quit = false;
    SDL_Event event;
    
    GameState currentState=MENU;
    int score = 0;
    Uint32 startTime = SDL_GetTicks();

    //Thêm biến cho delta time
    Uint32 lastTime = SDL_GetTicks(); 
    float deltaTime = 0.0f; // biến lưu thời gian giữa các frame

    while (!quit) {
        Uint32 currentTime = SDL_GetTicks();  // Lấy thời gian hiện tại
        deltaTime=(currentTime-lastTime)/1000.0f;
        lastTime=currentTime; // cập nhật thời gian hiện tại cho frame tiếp theo

        // Xử lý sự kiện
        while (SDL_PollEvent(&event) != 0) {
            if (event.type == SDL_QUIT)
                quit = true;
                // Xử lý tùy trạng thái game
                if(currentState==MENU){
                    // Nếu nhấn phím S, băt đầu game
                    if(event.type==SDL_KEYDOWN&&event.key.keysym.sym==SDLK_s){
                        currentState=PLAY;
                        score=0;
                        playerHealth=3;
                        startTime=SDL_GetTicks(); // reset thời gian sống
                        bullets.clear();
                        enemies.clear();
                        explosions.clear();
                    }
  }
  else if(currentState==PLAY){
      // Xử lý bắn đạn khi nhấn phím SPACE (chỉ bắn khi phím được nhấn xuống, không lặp lại khi giữ)
            if (event.type == SDL_KEYDOWN &&
                event.key.keysym.scancode == SDL_SCANCODE_SPACE &&
                event.key.repeat == 0) {
                if (currentTime - lastBulletTime >= bulletCooldown) {
                    Bullet newBullet;
                    newBullet.rect.w = bulletWidth;
                    newBullet.rect.h = bulletHeight;
                    newBullet.rect.x = playerRect.x + playerRect.w / 2 - bulletWidth / 2;
                    newBullet.rect.y = playerRect.y;
                    newBullet.startY = playerRect.y;
                    newBullet.speed = bulletSpeed;
                    bullets.push_back(newBullet);

                    lastBulletTime = currentTime; // Cập nhật thời gian bắn gần nhất
                    Mix_PlayChannel(-1,shootSound,0);
                }
                }
    }

    else if(currentState==HELP){
        // Xử lý sự kiện cho Help: nhấn ESC để trở về MENU
        if(event.type==SDL_KEYDOWN&& event.key.keysym.sym==SDLK_ESCAPE){
            currentState=MENU;
        }
    }
    else if(currentState==GAME_OVER){
        // Xử lý sự kiên Game Over: nhấn R để chơi lại, Q để thoát
        if(event.type==SDL_KEYDOWN){
            if(event.key.keysym.sym==SDLK_r){
                currentState=PLAY;
                score=0;
                playerHealth=3;
                startTime=SDL_GetTicks(); // reset thời gian sống
                bullets.clear();
                enemies.clear();
                explosions.clear();
            }
            else if(event.key.keysym.sym==SDLK_q){
                quit=true; // thoát game
            }
        }
    }
    }

    // Cập nhật logic game
    if(currentState==PLAY){
        // Xử lý di chuyển phi thuyền
        const Uint8* keyState = SDL_GetKeyboardState(NULL);
        float moveX = 0.0f, moveY = 0.0f;
        if (keyState[SDL_SCANCODE_W]) moveY -= playerSpeed * deltaTime;
        if (keyState[SDL_SCANCODE_S]) moveY += playerSpeed * deltaTime;
        if (keyState[SDL_SCANCODE_A]) moveX -= playerSpeed * deltaTime;
        if (keyState[SDL_SCANCODE_D]) moveX += playerSpeed * deltaTime;
        
        playerX+=moveX;
        playerY+=moveY;
        // Giới hạn biên
        if (playerX < 0) playerX = 0;
        if (playerX > SCREEN_WIDTH - playerRect.w) playerX = SCREEN_WIDTH - playerRect.w;
        if (playerY < 0) playerY = 0;
        if (playerY > SCREEN_HEIGHT - playerRect.h) playerY = SCREEN_HEIGHT - playerRect.h;

        // Cập nhật playerRect để render
        playerRect.x = static_cast<int>(playerX);
        playerRect.y = static_cast<int>(playerY);
        
        //spawn enemy theo cooldown
        float effectiveEnemySpeed = enemySpeed; // ban đầu enemySpeed = 150.0f

        if (score >= 30) {
            // Tăng tốc độ enemy 
            effectiveEnemySpeed = 200.0f;
        }
        
        Uint32 effectiveEnemySpawnCooldown = enemySpawnCooldown; // mặc định là 2000ms
        if(score>=20){
            effectiveEnemySpawnCooldown = 1500;
        }
        if (currentTime - lastEnemySpawnTime >= effectiveEnemySpawnCooldown) {
            int spawnCount = (score >= 40) ? 2 : 1;  // spawn 2 enemy nếu điểm >=40, ngược lại spawn 1 enemy
            for (int i = 0; i < spawnCount; i++) {
            Enemy newEnemy;
            newEnemy.rect.w = enemyWidth;
            newEnemy.rect.h = enemyHeight;
            //spawn enemy tại vị trí ngẫu nhiên trên trục X ở đầu màn hình
            newEnemy.rect.x = rand() % (SCREEN_WIDTH - enemyWidth);
            newEnemy.rect.y = 0; // bắt đầu từ màn hình
            newEnemy.speed = effectiveEnemySpeed;
            newEnemy.initialX = newEnemy.rect.x; // lưu vị trí ban đầu
            newEnemy.spawnTime = currentTime; // lưu thời gian spawn
            
            // Xác định xác suất di chuyển ZIGZAG dựa trên điểm số
    float probabilityZigzag = 0.5f; // mặc định nếu score < 10, ví dụ là 50%
    if (score >= 40)
        probabilityZigzag = 0.90f;
    else if (score >= 30)
        probabilityZigzag = 0.80f;
    else if (score >= 20)
        probabilityZigzag = 0.70f;
    else if (score >= 10)
        probabilityZigzag = 0.60f;

    // Sinh số ngẫu nhiên từ 0 đến 1
    float randomValue=static_cast<float>(rand()) / RAND_MAX;
    if(randomValue < probabilityZigzag)
        newEnemy.moveType=ZIGZAG;
    else
        newEnemy.moveType=STRAIGHT;

    enemies.push_back(newEnemy);
            }
    lastEnemySpawnTime=currentTime;
        }

        // Cập nhật vị trí đạn
        for (auto& bullet : bullets) {
            bullet.rect.y -=static_cast<int>(bullet.speed*deltaTime);;
        }
        
        const double PI=3.14159265358979323846; // hằng số PI
        const int amplitude=80; // biên độ của chuyển động ziczac
        const double frequency=0.5; // tần số, 1 chu kì mỗi giây

        // cập nhật vị trí enemy (di chuyển xuống)
        for(auto& enemy : enemies) {
            // cập nhật trục Y: enemy di chuyển xuống với tốc độ enemySpeed
            enemy.rect.y +=static_cast<int>(effectiveEnemySpeed*deltaTime);

            // Nếu enemy có kiểu ziczac thì cập nhật trục X theo hàm sin
            if(enemy.moveType==ZIGZAG){
                double elapsed=(currentTime-enemy.spawnTime)/1000.0; // thời gian đã trôi qua tính bằng giây
                int offset=static_cast<int>(amplitude* sin(2*PI*frequency*elapsed)); // tính offset theo hàm sin
                // cập nhật vị trí X của enemy dựa trên initialX và offset
                enemy.rect.x=enemy.initialX+offset;
                //clamp nếu cần:
                if(enemy.rect.x<0) enemy.rect.x=0;
                if(enemy.rect.x>SCREEN_WIDTH-enemy.rect.w)
                enemy.rect.x=SCREEN_WIDTH-enemy.rect.w;
            }
            else{
                enemy.rect.x=enemy.initialX;
            }
        }

        //kiểm tra enemy ra khỏi màn hình và giảm máu
        for(int i=enemies.size()-1;i>=0;i--){
            if(enemies[i].rect.y>SCREEN_HEIGHT){
                playerHealth--;
                Mix_PlayChannel(-1,hitsound,0);
                enemies.erase(enemies.begin()+i);
                if(playerHealth<=0){
                    currentState=GAME_OVER;
                    cout<<"Game over! "<<endl;
                }
            }
        }

        // kiểm tra va chạm giữa nhân vật và enemy
        // Gỉa sử enemies là vector<Enemy>, plaerRect là SDL_Rect của phi thuyền
        for (int i=enemies.size()-1; i>=0; i--){
            // Nếu enemy va chạm với nhân vật
        if (checkCollision(enemies[i].rect,playerRect)){
            playerHealth--;
            Mix_PlayChannel(-1,hitsound,0);
            // xóa kẻ địch khỏi danh sách
            enemies.erase(enemies.begin()+i);
            if (playerHealth <= 0){
                cout<<" Game over! " <<endl;
                quit=true;
                break;
            }
        }
    }     

        // kiểm tra va chạm giữa đạn và enemy
        // duyệt ngược từ cuối vector để có thể xóa phần tử khi có va chạm
        for(int i = bullets.size() - 1; i >= 0; i--){
            for( int j = enemies.size() - 1; j >= 0; j--){
                if (checkCollision(bullets[i].rect, enemies[j].rect)) {
                    score++;
                    Mix_PlayChannel(-1,explosionSound,0);
                    // Tạo hiệu ứng nổ
                    Explosion exp;
                    exp.expRect.x=enemies[j].rect.x+ enemyWidth/2 - 65; // căn giữa hiệu ứng nổ
                    exp.expRect.y=enemies[j].rect.y;
                    exp.expRect.w=130; // kích thước khung
                    exp.expRect.h=130;
                    exp.frame=0;
                    exp.maxFrames=24;
                    exp.startTime=SDL_GetTicks();
                    exp.frameDuration=100;
                    exp.isActive=true;
                    explosions.push_back(exp);

                    // nếu va chạm, xóa đạn và enemy đó
                    bullets.erase(bullets.begin()+i);
                    enemies.erase(enemies.begin() + j);
                    break;  // thoát khỏi vòng lặp cho viên đạn này
                }
            }
        }

            // Tính thời gian sống của người chơi
            Uint32 elapsedTime=currentTime-startTime;
            float survivalTime=elapsedTime/1000.0f; // chuyển đổi sang giây
        
            // Xóa đạn khi bay khỏi màn hình
        bullets.erase(remove_if(bullets.begin(), bullets.end(),
            [](const Bullet& b) { return b.rect.y + b.rect.h < 0; }), bullets.end());

            // xóa enemy khi đi ra khỏi màn hình
            enemies.erase(remove_if(enemies.begin(), enemies.end(),
        [](const Enemy& e) { return e.rect.y > SCREEN_HEIGHT; }), enemies.end());

        // cập nhật hiệu ứng nổ: tính frame hiện tại
        for(auto &exp:explosions){
            if(exp.isActive){
                Uint32 now=SDL_GetTicks();
                Uint32 elapsed=now-exp.startTime;
                exp.frame=elapsed/exp.frameDuration;
                if(exp.frame>=exp.maxFrames){
                    exp.isActive=false;
                }
            }
        }

        // xóa hiệu ứng nổ đã kết thúc
        explosions.erase(remove_if(explosions.begin(),explosions.end(),
        [](const Explosion& exp){ return !exp.isActive; }), explosions.end());
    }

        // Vẽ màn hình với màu đen
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
        SDL_RenderClear(renderer);
if(currentState==MENU){
    // Render menu chính
    SDL_Color white={255, 255, 255, 255};
    SDL_Texture* menuTexture=RenderText("Press S to Start,H for Help,Q to Quit", font, white,renderer);
    if(menuTexture){
       int w,h;
       SDL_QueryTexture(menuTexture,NULL,NULL,&w,&h);
       SDL_Rect menuRect={SCREEN_WIDTH/2-w/2,SCREEN_HEIGHT/2-h/2,w,h};
        SDL_RenderCopy(renderer,menuTexture,NULL,&menuRect);
        SDL_DestroyTexture(menuTexture);
    }
}
else if(currentState==PLAY){

         // Vẽ texture của nhân vật
         SDL_RenderCopy(renderer, playerTexture, NULL, &playerRect);

        // Vẽ đạn 
        if (bulletTexture) {
            for (const auto &bullet : bullets) {
                SDL_RenderCopy(renderer, bulletTexture, NULL, &bullet.rect);
            }
        }
  
        // vẽ enemy 
        if(enemyTexture) {
            for (const auto &enemy : enemies) {
                SDL_RenderCopy(renderer, enemyTexture, NULL, &enemy.rect);
            }
        }

        // vẽ hiệu ứng nổ sử dụng sprite sheet
        if(explosionTexture){
            SDL_Rect srcRect;
            srcRect.w=130; // kích thước khung
            srcRect.h=130;
            for(const auto& exp:explosions){
                if(exp.isActive){
                    srcRect.x=exp.frame*130;
                    srcRect.y=0;
                    SDL_RenderCopy(renderer,explosionTexture,&srcRect,&exp.expRect);
                }
            }
        }
        // Render điểm số và lives
        SDL_Color white={255,255,255,255};
        string scoreStr="Score: "+to_string(score);
        string liveStr="Lives: "+to_string(playerHealth);
        SDL_Texture* scoreTexture= RenderText(scoreStr,font,white,renderer);
        SDL_Texture* liveTexture=RenderText(liveStr,font,white,renderer);
        if(scoreTexture&& liveTexture){
            int sw,sh,lw,lh;
            SDL_QueryTexture(scoreTexture,NULL,NULL,&sw,&sh);
            SDL_QueryTexture(liveTexture,NULL,NULL,&lw,&lh);
            SDL_Rect scoreRect={10,10,sw,sh};
            SDL_Rect liveRect={10,10+sh+5,lw,lh};
            SDL_RenderCopy(renderer,scoreTexture,NULL,&scoreRect);
            SDL_RenderCopy(renderer,liveTexture,NULL,&liveRect);
            SDL_DestroyTexture(scoreTexture);
            SDL_DestroyTexture(liveTexture);
        }
    }
    else if(currentState==HELP){
        // Render hướng dẫn chơi game
        SDL_Color white={255,255,255,255};
        SDL_Texture* helpText=RenderText("WASD:Move, SPACE: Shoot,ESC: Back",font,white,renderer);
        if(helpText){
            int w,h;
            SDL_QueryTexture(helpText,NULL,NULL,&w,&h);
            SDL_Rect helpRect={ SCREEN_WIDTH/2-w/2,SCREEN_HEIGHT/2-h/2,w,h};
            SDL_RenderCopy(renderer,helpText,NULL,&helpRect);
            SDL_DestroyTexture(helpText);
        }
    }

    else if (currentState==GAME_OVER) {
        // Render màn hình game over
        SDL_Color red = {255,0,0,255};
        SDL_Texture* goText = RenderText("GAME OVER! Press R to Retry, Q to Quit", font, red, renderer);
        if (goText) {
            int w, h;
            SDL_QueryTexture(goText, NULL, NULL, &w, &h);
            SDL_Rect goRect = { SCREEN_WIDTH/2 - w/2, SCREEN_HEIGHT/2 - h/2, w, h };
            SDL_RenderCopy(renderer, goText, NULL, &goRect);
            SDL_DestroyTexture(goText);
        }
    }
        SDL_RenderPresent(renderer);
      
        //Giới hạn FPS
        Uint32 frameTime=SDL_GetTicks()-currentTime;
        const Uint32 frameDelay=1000/FPS;
        if(frameDelay>frameTime){
            SDL_Delay(frameDelay-frameTime);
        }
    }

    // giải phóng
    Mix_FreeChunk(shootSound);
    Mix_FreeChunk(hitsound);
    Mix_FreeChunk(explosionSound);
    SDL_DestroyTexture(playerTexture);
    if(explosionTexture) SDL_DestroyTexture(explosionTexture);
    SDL_DestroyTexture(enemyTexture);
    SDL_DestroyTexture(bulletTexture);
    TTF_CloseFont(font);
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    Mix_CloseAudio();
    TTF_Quit();
    IMG_Quit();
    SDL_Quit();
    return 0;
    }


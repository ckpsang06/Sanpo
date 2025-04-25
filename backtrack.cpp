#include<iostream>
using namespace std;

int n,X[100];

void inkq(){
    for(int i=1;i<=n;i++){
        cout<<X[i];
    }
    cout<<endl;
}

void backtrack(int i){
    for(int j=0;j<=1;j++){
        X[i]=j;
        if(i==n){
            inkq();
        }
        else{
            backtrack(i+1);
        }
    }
}

int main(){
    cin>>n;
    for(int i=1;i<=n;i++){
    backtrack(i);
    }
    return 0;
}
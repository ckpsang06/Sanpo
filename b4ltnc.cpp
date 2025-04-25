#include<bits/stdc++.h>
using namespace std;

bool lasnt(int &x){
    for(int i=2;i*i<=x;i++){
        if(x%i==0){
            return false;
        }
    }
    return true;
}
int main(){
    int n;
    cin>>n;
    vector<int> a(n);
    vector<int> b;
    for(int i=0;i<n;i++){
        cin>>a[i];
    }
    for(int i=0;i<n;i++){
        if(lasnt(a[i])){
            b.push_back(a[i]);
        }
    }
    sort(b.begin(),b.end());
    int bindex=0;
    for(int i=0;i<n;i++){
        if(lasnt(a[i])){
            a[i]=b[bindex++];
        }
        else{
            a[i]=a[i];
        }
        }
    for(int i=0;i<n;i++){
        cout<<a[i]<<" ";
    }
    return 0;
}

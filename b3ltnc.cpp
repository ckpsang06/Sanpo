#include<bits/stdc++.h>
using namespace std;

int main(){
    vector<int> a;
    int x;
    while(cin>>x){
        a.push_back(x);
        if(x == -1) break;
    }
    for(size_t i=0;i<a.size();i++){
        bool dup=false;
        for(size_t j=0;j<a.size();j++){
            if(i!=j&&a[j]==a[i]){
                dup=true;
                break;
                    }
                }
                    if(!dup){
                        cout<<a[i]<<" ";
                    }
    }
return 0;
}
#include<iostream>
using namespace std;

int main(){
    int n;
    cin>>n;
    int a[n];
    for(int i=0;i<n;i++){
        cin>>a[i];
    }
    bool counted[n]={false};
    for(int i=0;i<n;i++){
        if(!counted[i]){
            int count=1;
            for(int j=i+1;j<n;j++){
                if(a[j]==a[i]){
                    count++;
                    counted[j]=true;
                }
            }
            cout<<a[i]<<" "<<count<<endl;
        }
    }
    return 0;
}

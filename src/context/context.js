import React ,{useState,useEffect}from'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';
const rootUrl='https://api.github.com';
const GithubContext=React.createContext();

// Provider, Consumer - GithubContext.Provider

//children yani jo jo components GithubProvidr tag ke andr likhe hai hmne  wo . go to dashboard.js  component and check.
const GithubProvider=({children})=>{
    const [githubUser, setGithubUser] = useState(mockUser);
    const [repos, setRepos] = useState(mockRepos);
    const [followers, setFollowers] = useState(mockFollowers);

    //
    // console.log(githubUser);
    // console.log(repos);
    // console.log(followers);



    //request loading

    const [requests,setRequests]=useState(0);
    const [isLoading,setIsLoading]=useState(false);
    //error
    const [error,setError]=useState({show:false,msg:""})
    //check rate

function toggleError(show=false,msg='' ){
    setError({show,msg})
}


const searchGithubUser=async (user)=>{
    console.log(user);
    toggleError();
    setIsLoading(true);
    //set loading(true)
    const response = await  axios (`${rootUrl}/users/${user}`).catch(err=>console.log(err));
        if(response){
            setGithubUser(response.data);
            const {login,followers_url}=response.data;
            //repos
        //    await .then(response=>{
        //         setRepos(response.data);
        //     })
        //     await .then(response=>{
        //         setFollowers(response.data);
        //     })
//taki sari api ka data ek sath load ho isliye hamne ye kiya
        await Promise.allSettled([
            axios( `${rootUrl}/users/${login}/repos?per_page=100`),
            axios( `${rootUrl}/users/${login}/followers`)])
            .then((results) => {
                const [repos, followers] = results;
                const status = 'fulfilled';
                if (repos.status === status) {
                  setRepos(repos.value.data);
                }
                if (followers.status === status) {
                  setFollowers(followers.value.data);
                }
              })
              .catch((err) => console.log(err));
            //more logic here
            //(https://api.github.com/users/john-smilga/repos?per_page=100)
            //(https://api.github.com/users/john-smilga/followers)

        }
        else {
            toggleError(true,'No user found with that username!!')
        }
        checkRequests();
        setIsLoading(false);
}



    const checkRequests=()=>{
        axios.get(`${rootUrl}/rate_limit`).then((data)=>{
            //console.log(data);
            console.log(data.data.rate.remaining);
            let remaining=data.data.rate.remaining
            setRequests(remaining);
            if(remaining===0){
                toggleError(true,'sorry you exceed your request limit!!')
            }
        }).catch((err)=>console.log(err));
    }
    useEffect(()=>{
        checkRequests();
        console.log('hey app loaded');

    },[])
    return(
<>
       
         
            <GithubContext.Provider
              value={{ githubUser:githubUser,repos: repos,followers: followers ,requests:requests,error:error,isLoading:isLoading,searchGithubUser:searchGithubUser}}>
              {children}   
            </GithubContext.Provider>


            </>
    )

}

export { GithubProvider, GithubContext };
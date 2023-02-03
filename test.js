// async function fetchDemo(){
//     let formData = new FormData();
//     formData.append('task_id', 'adunare');
//     formData.append('round_id', 'arhiva-de-probleme');
//     formData.append('compiler_id', 'cpp14');
//     formData.append('solution', '#include <iostream> int main(){std::cout<<1;return 0;}');

//     let resp = await fetch('https://infoarena.ro/submit', {
//         method: 'POST',
//         header: {
//             'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryxoaj7FqAPwtFhFnc',
//             accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
//             cookie: '__utmz=198463735.1672697492.727.224.utmccn=(referral)|utmcsr=google.com|utmcct=/|utmcmd=referral; infoarena2_session=mias1m8d5k66igideigb9ijql7; __utma=198463735.1000158245.1625759898.1672845857.1673113114.729; __utmb=198463735; __utmc=198463735',  
//         },
//         body: formData,
//     });

//     console.log(resp);
// }


// fetchDemo();

// async function fetchCodeforces(){
//     let sendData = {
//         contestId: '1779',
//         submittedProblemIndex: 'H',
//         programTypeId: '54',
//         source: 'jkndfg',
//         tabSize: '4'
//     };

//     let resp = await fetch('https://codeforces.com/problemset/submit?csrf_token=f9bda69774a1001e940dfd482d10e629', {
//         method: 'POST',
//         header: {
//             accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
//             'Content-Type': 'application/x-www-form-urlencoded',
//             // Connection: 'keep-alive',
//             Cookie: 'JSESSIONID=EC95F78254BD34787659FB172B1A6110-n1; 39ce7=CFKZ51eB; __utma=71512449.1734726784.1673120126.1673120126.1673120126.1; __utmb=71512449.11.10.1673120126; __utmc=71512449; __utmz=71512449.1673120126.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmt=1; evercookie_etag=dmxe6gkuz59op7rb3d; evercookie_cache=dmxe6gkuz59op7rb3d; evercookie_png=dmxe6gkuz59op7rb3d; 70a7c28f3de=dmxe6gkuz59op7rb3d; X-User-Sha1=d351ab22e19cb860a2cded9ff4f27b351052cc8b',

//         },
//         body: (new URLSearchParams(sendData)).toString()
//     });
// }

// fetchCodeforces();

async function bebeinfo(){
    let resp = await fetch('https://www.pbinfo.ro/ajx-module/php-solutie-incarcare.php', {
        moethod: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            form_token:	'03063315c98a51a38b03c052d3be92162a97c0b6',
            id: '3966',
            pagina: 'probleme',
            local_ip: '4b3dd866-a8a8-48b5-9556-9e645e2ecb13.local',
            limbaj_de_programare: 'cpp',
            sursa: '#include <iostream>',
            Cookie:'_ga=GA1.2.956083132.1673118556; __gads=ID=4a344cc288f72617-22640ef348da00cc:T=1673118555:RT=1673118555:S=ALNI_MaN1L-0kXYL466PwBW6qALvGS7Z-A; __gpi=UID=00000b9f85536570:T=1673118555:RT=1674588804:S=ALNI_Mb0oyhn5gkd15Sh0HesaVXOMcN5tQ; SSID=gt0vpia8vv6h1d2vq2nn2gkqh2; vizitator_track=05e9df8259b8a0aa3ca00c2ac1269467b3795cdc; _gid=GA1.2.1065969783.1674588805; cookies_accepted=OK; _gat=1'
        }
    });

    let data = await resp.json();

    console.log(data);
}

bebeinfo();
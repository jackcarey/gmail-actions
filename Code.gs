/*====================================================================================================================================*
  Gmail Actions by Jack Carey
  ====================================================================================================================================
  Version:      1.1.0
  Project Page: https://github.com/jackcarey/gmail-actions
  Copyright:    (c) 2020 by Jack Carey (jackcarey.co.uk)
  License:      GNU General Public License, version 3 (GPL-3.0) 
                http://www.opensource.org/licenses/gpl-3.0.html
  ------------------------------------------------------------------------------------------------------------------------------------
  Description: An Apps Script for clearing out Gmail based on search queries.
  Files:
    Code.gs (this):
      - scheduled() - Scheduled actions for marking emails as not important and archiving
      - gmailLoop() - generic function for running a GmailApp action
  ------------------------------------------------------------------------------------------------------------------------------------
  Set-up:
  1. Copy this file into a new project at script.google.com.
  2. Edit 'scheduled' to run the actions you want to take. Use Gmail itself to make sure your queries return the messages you expect.
     Search operator reference: https://support.google.com/mail/answer/7190
  3. Set up a trigger for 'scheduled' to run as often as you like. Each gmailLoop handles 500 threads, so once per day should be sufficient for most accounts.
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  1.1.0 - 2020-01-02 - Added 'long' parameter to keep gmailLoop running for > 500 threads
  1.0.0 - 2018-05-27 - Initial release
 *====================================================================================================================================*/

function scheduled(){
  gmailLoop("Not Important",
                 "is:important older_than:6m",
               "markThreadsUnimportant"
              );
  gmailLoop("Archive",
            "in:inbox -is:starred -is:important older_than:3m",
               "moveThreadsToArchive"
              );
}

function clean(){
    gmailLoop("Clean Archive",
            "in:inbox -is:starred -is:important older_than:1m",
               "moveThreadsToArchive",
              true
              );
}

/*
* @param query - The search query to find threads.
* @param action - Bulk thread function
* @param name - A string to more easily identify the action taken.
* @param long - Boolean. Complete action on more than 500 results. Max. execution time might be reached. Default: false.
*/
function gmailLoop(name,query,action,long){
  var results = query ? GmailApp.search(query) : null; //maximum of 500 results
  var count = results.length;
  var pages = count/100;
  name = name ? name : (action+" "+query);
  if(count>0){
  for(var i=0; i < pages ;i++){ //most actions handle <=100 threads at once, so break them down.
    var page = i;
    var start = page*100;
    var end = start+99;
    var firstSubject = results[start].getFirstMessageSubject();
    console.log("%s (%s/%s | %s - %s) | %s - '%s'",
                name,
                page+1,
                Math.ceil(pages),
                start,
                end,
                Utilities.formatDate(results[start].getLastMessageDate(),"UTC","yyyy-MM-dd"),
                firstSubject.slice(0,20)+(firstSubject.length>20?"...":"")
      );
    GmailApp[action](results.slice(start,end)); 
  }
  }else{
    console.log("%s no results for '%s'",name,query);
  }
  if(count>=500 && long){
    console.log("%s returned %s results and 'long' is true. Running again...",name,count);
    gmailLoop(name,query,action,long); //run the query again
  }
}

/*====================================================================================================================================*
  Gmail Actions by Jack Carey
  ====================================================================================================================================
  Version:      1.0.1
  Project Page: https://github.com/jackcarey/gmail-actions
  Copyright:    (c) 2018 by Jack Carey (jackcarey.co.uk)
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
  3. Set up a trigger for 'scheduled' to run as often as you like. Each gmailLoop handles 500 threads, so a maximum of once per day should be sufficient for most accounts.
  ------------------------------------------------------------------------------------------------------------------------------------
  Changelog:
  1.0.1 - 2020-10-24 - Made logging more concise. Changed name from 'gmail clearout' to 'gmail actions'
  1.0.0 - 2018-05-27 - Initial release
 *====================================================================================================================================*/

function scheduled(){
  gmailLoop("Archive",
            "older_than:3m is:read -in:archive",
            "moveThreadsToArchive"
            );
}

/*
* @param name - A string to more easily identify the action taken.
* @param query - The search query to find threads.
* @param action - Bulk thread function
*/
function gmailLoop(name,query,action){
  var results = query ? GmailApp.search(query) : null; //maximum of 500 results
  var pages = results.length/100;
  for(var i=0; i < pages ;i++){ //most actions handle <=100 threads at once, so break them down.
    var page = i;
    var start = page*100;
    var end = start+99;
    console.log("%sPage %s/%s (%s - %s of %s) | %s | %s | %s",
                (name?"'"+name+"' ":""),
                page,
                pages,
                start,
                end,
                results.length,
               Utilities.formatDate(results[start].getLastMessageDate(),"UTC","YYYY-MM-dd"),
               results[start].getId(),
               results[start].getFirstMessageSubject().slice(0,20)
              );
    GmailApp[action](results.slice(start,end)); 
  }
}

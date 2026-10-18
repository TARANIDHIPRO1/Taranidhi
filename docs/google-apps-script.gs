/* TaraNidhi -> Google Sheet. Setup: create a Sheet, Extensions > Apps Script, paste this,
   Deploy > New deployment > Web app > Execute as: Me, Access: Anyone. Send me the /exec URL. */
function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (x) { return ContentService.createTextOutput('bad'); }
  var tab = d.kind === 'registration' ? 'Registrations' : 'Enquiries';
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(tab) || ss.insertSheet(tab);
  var cols = d.kind === 'registration' ? ['name','phone','email','dob','place','source'] : ['name','phone','email','topic','company','city','message'];
  if (sh.getLastRow() === 0) sh.appendRow(['timestamp'].concat(cols));
  sh.appendRow([new Date()].concat(cols.map(function (c) { return d[c] || ''; })));
  return ContentService.createTextOutput('ok');
}

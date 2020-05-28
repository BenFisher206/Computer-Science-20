

General description:

	This calendar program is currently designed to have a C program generate a select sample of static HTML pages for the Calendar_Main.HTML file to use.
	The static HTML page structure is chosen due to more complex issues as described below.

	The C genertation program and code is found under the generate directory. 
	Upon clicking on the executable, a the webs/static directory is created with all of the static HTML pages inside.
	Then open Calendar_Main.html and use the dropdown menus to select what calendars to show

	Due to github's restrictions on uploading more than 100 files at a time, you will need to follow the above steps to generate the static HTML pages.

The C program uses a time stamp called "Greg Time":

	This time stamp is calculated by first determining the number of days has passed since the creation of the Julian calendar.
	Note: If the given date is before October 15, 1582 then the date is given in Julian Days else
		the date is given in gregorian days (Julian days but including the leap year on every 4th century).
	Then the epoch is set to be October 15, 1582 and the timestamp is converted into seconds
	If the date includes a time of day, the time is added onto the greg time in seconds
	Therefore, it can be concluded that greg time is the number of seconds since October 15, 1582 at 00:00:00

	In order to prevent incorrect Greg time, I have set the limit the program can go in the past to be the year 1600.
	The year 1600 is chosen for its divisibility by 400 years and all other lower multiples of 4, 25 and 100 years.
	This is because on October 4th, 1582 the pope Gregory decided to skip 15 days in order 
	to account for the leap days missed on every 400th year, thus causing a gap in time.

	
The future for this C program:

	The reason static pages are currently being used is because Chrome does not allow arguments to be passed to an executable file.
	For security reasons, the user has to download the executable file manually every single time, and no arguements can be passed to such a file.
	
	Therefore, I hope to setup a server for my Calendar program in the near future
	this will allow the user to dynamically select any date and press "submit" to generate a calendar and display it.
	It will also allow other users, such as other family members or operational team members, to merge their calendars.

	I also plan on incorporating into the calendars: holidays, specific information, etc. and categorize it using different highlights
	A sample of these highlights have already been incorporated into the CSS file and are shown under the "colors" button 

	I also plan on creating a standalone application with a GUI interface along with the server based application. 
	This will allow me to use the calendar without the need of internet and it doesn't need to worry about web browser security.


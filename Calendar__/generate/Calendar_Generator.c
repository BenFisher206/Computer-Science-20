/*
 *	C program to generate HTML files that contain calendar information based off of a config file
 *
 */

# include <stdlib.h>     //     including standard library of commands
# include <stdio.h>      //     including standard input / output library of commands
# include <string.h>     //     including string library of commands
# include <math.h>
# include <dirent.h>
# include <sys/stat.h>

/*
# include <sys\timeb.h>                       //   *****   DOS   <sys\timeb.h>      FUNCTION OPERATION (1 OF 14)    *****           //   *****    <sys\timeb.h>        DOS  FUNCTION OPERATION    *****
char OPERATING_SYSTEM[16]="DOS";              //   *****   DOS   <sys\timeb.h>      FUNCTION OPERATION (1 OF 14)    *****           //   *****    <sys\timeb.h>        DOS  FUNCTION OPERATION    *****
# include <dir.h>                             //   *****   DOS   <sys\timeb.h>      FUNCTION OPERATION (1 OF 14)    *****           //   *****    <sys\timeb.h>        DOS  FUNCTION OPERATION    *****
//*/

/*
# include <sys/time.h>                      //   *****  LINUX  <sys/timeb.h>      FUNCTION OPERATION (1 OF 14)    *****           //   *****    <sys/timeb.h>       LIUNX FUNCTION OPERATION    *****
char OPERATING_SYSTEM[16]="LINUX";          //   *****  LINUX  <sys/timeb.h>      FUNCTION OPERATION (1 OF 14)    *****           //   *****    <sys/timeb.h>       LIUNX FUNCTION OPERATION    *****
# include <unistd.h>                        //   *****  LINUX  <sys/timeb.h>      FUNCTION OPERATION (1 OF 14)    *****           //   *****    <sys/timeb.h>       LIUNX FUNCTION OPERATION    *****
//*/

# define FGETS_SIZE 4096 // Variable size dedicated to FGETS string file reading process
# define CHUNK_SIZE 4096 // Variable size dedicated to FREAD data file reading process

# define GetCurrentDir getcwd

# define QUAD_BUFSIZE 16384
# define DBL_BUFSIZE 8192
# define BUFSIZE 4096
# define KILO_SIZE 2048
# define KILOSIZE 1024
# define NAME_SIZE 512
# define NAMESIZE 256
# define HALF_NAME 128
# define QUAD_WORD 64
# define DBL_WORDSIZE 32
# define WORDSIZE 16
# define BYTESIZE 8
# define NIBBLESIZE 4
# define BI_SIZE 2

int printCalendar(int origin_day, int origin_month, int origin_year, int end_day, int end_month, int end_year);
double getGregDate(int day, int month, int year, int hours, int minutes, int seconds); // Convert a calendar date to Gregorian time
int processConfig(char infile_name[QUAD_WORD], double *gregPtr, char (*dateInformation)[HALF_NAME]);
void convertGreg(double original_time_stamp, int *day, int *month, int *year); // Return calendar date information from a given gregorian date (exclude time)

char notifications[KILOSIZE][QUAD_WORD];


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//                  Beginning of Main function
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

void main(){

    char buf[HALF_NAME];
    char calendarDates[BI_SIZE][WORDSIZE];
    char infile_name[DBL_WORDSIZE] = "Config\\Calendar_types__.cfg";
    char outfile_folder[QUAD_WORD];

    int start_year, start_month, start_day, end_year, end_month, end_day;

    DIR *dir;
    FILE *infile;

    if ((infile = fopen(infile_name, "r+b")) == NULL)     //     checking if outfile exists, returns error if doesn't exist
    { fprintf(stderr, "Cannot open main input file.\n"); return; }

    // Determines if folder exists, if it does exist delete it and then create a new empty folder under the same name
    if((dir = opendir("..\\webs\\static")) == NULL){ mkdir("..\\webs\\static"); }
    else { system("RD /S /Q ..\\webs\\static"); mkdir("..\\webs\\static"); }

    while(!feof(infile)){
        fgets(buf, HALF_NAME, infile);
        if(strlen(buf) < 5 || strstr(buf, "::") != 0){ continue; }
        sscanf(buf, "%d-%d-%d\t%d-%d-%d", &start_year, &start_month, &start_day, &end_year, &end_month, &end_day); // Split the data into their respective variables
        
        // Create a subfolder in the static folder under the same name as the start year
        sprintf(outfile_folder, "..\\webs\\static\\%d", start_year);
        if((dir = opendir(outfile_folder)) == NULL){ mkdir(outfile_folder); }
        printCalendar(start_day, start_month, start_year, end_day, end_month, end_year); // Create html page
    }
    
}



//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//                  Beginning of printCalendar function
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------


int printCalendar(int origin_day, int origin_month, int origin_year, int end_day, int end_month, int end_year){
    // Given a start and end date, create an html page that displays a calendar of the requested time

	char outfile_name[QUAD_WORD];
	char config_name[DBL_WORDSIZE] = "Config\\config.cfg";
	char month_abbrevs[12][NIBBLESIZE] = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
    char dateInformation[QUAD_WORD][HALF_NAME];

	char background_class[DBL_WORDSIZE] = "days";

	double starting_greg_value = 0, origin_greg_value = 0, end_greg_value = 0, current_greg_value = 0;
    double holiday_dates[QUAD_WORD];

	int starting_weekday = 1;

	int n_day = 0, n_month = 0, n_year = 0;
	int max_days[12] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
	int n_weeks = 13;
    int month_span = 0;

	FILE *infile;
	FILE *outfile;

    if((origin_year) % 4 == 0 && ((origin_year) % 100 != 0 || (origin_year) % 400 == 0)){ max_days[1] = 29; }
    if(origin_year < 1600){                                            fprintf(stderr, "---------------- ERROR INVALID START YEAR ------------");                    return 1; }
    if(end_year < 1600){                                               fprintf(stderr, "---------------- ERROR INVALID END YEAR ------------");                      return 1; }
    if(origin_month <= 0 || origin_month > 12){                        fprintf(stderr, "---------------- ERROR INVALID START MONTH ------------");                   return 1; }
    if(end_month <= 0    || end_month > 12){                           fprintf(stderr, "---------------- ERROR INVALID END MONTH ------------");                     return 1; }
    if(origin_day <= 0   || origin_day > max_days[origin_month - 1]) { fprintf(stderr, "---------------- ERROR INVALID START DAY FOR REQUESTED MONTH ------------"); return 1; }
    if(end_day <= 0      || end_day > max_days[end_month - 1]) {       fprintf(stderr, "---------------- ERROR INVALID END DAY FOR REQUESTED MONTH ------------");   return 1; }

	starting_greg_value = getGregDate(origin_day, origin_month, origin_year, 0, 0, 0);
	origin_greg_value = starting_greg_value;
	end_greg_value = getGregDate(end_day, end_month, end_year, 0, 0, 0);
	starting_weekday = (((long long) starting_greg_value - (2*86400))%(7*86400))/86400 + 1;
	starting_greg_value -= (starting_weekday-1)*86400;
	n_weeks = ceil(((end_greg_value - starting_greg_value)/86400)/7);
	convertGreg(starting_greg_value, &n_day, &n_month, &n_year);
	if((n_year) % 4 == 0 && ((n_year) % 100 != 0 || (n_year) % 400 == 0)){ max_days[1] = 29; }
    else { max_days[1] = 28; }
    if(n_year < 1600){ fprintf(stderr, "---------------- ERROR CALENDAR HAS DATES BEFORE 1600 ------------"); return 1; }
    month_span = (end_month + 12*(end_year - origin_year)) - origin_month;
    sprintf(outfile_name, "..\\webs\\static\\%d\\%d_%d_%d.html", origin_year, origin_month, month_span, origin_year);

	if ((outfile = fopen(outfile_name, "w+b")) == NULL)     //     checking if outfile exists, returns error if doesn't exist
  	{ fprintf(stderr, "Cannot open output file.\n"); return 1; }

    if(processConfig(config_name, holiday_dates, dateInformation) == 1){ 
        fprintf(stderr, "----------------- ERROR INPUT FILE DNE --------------------");
        return 1;
    }
    // for(int i=0; i<9; i++){ printf("_%s_\n", dateInformation[i]); }
    // for(int i=0; i<9; i++){ printf("_%f_\n", holiday_dates[i]); }


    fprintf(outfile, "<!-- %d - %d - %d -->\r\n", origin_year, end_year, n_year);
	fprintf(outfile, "<!DOCTYPE html>\r\n");
	fprintf(outfile, "<html>\r\n");
	fprintf(outfile, "<head><title>Simple Calendar</title><link rel=\"stylesheet\" href=\"../../style.css\"></head>\r\n");
	fprintf(outfile, "<div id=\"wrapper\">\r\n");
	fprintf(outfile, "<body>\r\n");
	fprintf(outfile, "\t<table id='main'>\r\n");

    if(origin_greg_value < end_greg_value){
    	for(int i=0; i<n_weeks; i++){ // Print out the next 13 weeks after the 1st week

	   	    fprintf(outfile, "\r\n\t\t<tr>\r\n"); // Start of next row
		    for(int n=0; n<7; n++){ // Each week has 7 days so print 7 consecutive cells with information
    			current_greg_value = getGregDate(n_day, n_month, n_year, 0, 0, 0);
        		if(current_greg_value < origin_greg_value || current_greg_value > end_greg_value){ strcpy(background_class, "daysGrey"); }
  	   	    	else if((origin_month%2) - (n_month%2) != 0){									   strcpy(background_class, "daysYellow"); }
		       	else{ 																			   strcpy(background_class, "days"); }

    			fprintf(outfile, "\r\n\t\t\t<td class=\"%s\"><table><tr><td><table><tr><td class=\"smallFont\">%s %d\r\n", background_class, month_abbrevs[n_month - 1], n_year);
    	   		fprintf(outfile, "\r\n\t\t\t</td></tr><td class=\"nmbs\">%d\r\n", n_day);
	   	  	    fprintf(outfile, "\t\t\t</td></table></td><td><table class=\"top_description\"><tr><td>&nbsp;\r\n");
    			fprintf(outfile, "\t\t\t</td></tr><tr><td>&nbsp;\r\n");
    			fprintf(outfile, "\t\t\t</td></tr></table></td></tr></table><table class=\"details\"><tr><td>&nbsp;\r\n");
    			fprintf(outfile, "\t\t\t</td></tr><tr><td>&nbsp;\r\n");
    			fprintf(outfile, "\t\t\t</td></tr><tr><td>&nbsp;\r\n");
    			fprintf(outfile, "\t\t\t</td></tr><tr><td>&nbsp;\r\n");
    			fprintf(outfile, "\t\t\t</td></tr></table></td>\r\n");
    			n_day++;
    			// Check if the next cell is in a new month/year
    			if(n_day > max_days[n_month - 1]){ n_month++; n_day = 1; }
	       		if(n_month > 12){ n_month = 1; n_year++; }
        		// Determine if leap year and change the max days in Februaury accordingly
    			if((n_year) % 4 == 0 && ((n_year) % 100 != 0 || (n_year) % 400 == 0)){ max_days[1] = 29; }
	       		else { max_days[1] = 28; }
        	}
		fprintf(outfile, "\r\n\t\t</tr>\r\n"); // End of row
	    }
    }
    else { fprintf(stderr, "-------------------------- ERROR START DATE IS AFTER END DATE ---------------------------"); return 1; }

	fprintf(outfile, "\r\n\t</table></body></div></html>\r\n"); // Close the main table/body/html page


	fclose(outfile); // close the output file
	return 0;
}



//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//                  Beginning of getGregDate function
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

double getGregDate(int day, int month, int year, int hours, int minutes, int seconds){
	/* Determine Gregorian Value of given date with epoch beginning at October 15, 1582 */

    unsigned long long a = (14 - month) / 12;
    unsigned long long y = year + 4800 - a;
    unsigned long long m = month + 12*a - 3;

    long long jdn = 0;

    // Determine if before epoch, if not then use the Julian calendar instead of Gregorian Calendar
    if ((year > 1582) || (year == 1582 && month > 10) || 
        (year == 1582 && month == 10 && day > 15) ||
        (year == 1582 && month == 10 && day == 15 && hours > 0) ||
        (year == 1582 && month == 10 && day == 15 && hours == 0 && minutes >= 0) ||
        (year == 1582 && month == 10 && day == 15 && hours >= 0 && minutes == 0 && seconds > 0)
       ) {

        jdn = (day + (153*m+2)/5 + 365*y + y/4 - y/100 + y/400 - 32045); // Determines time in Gregorian days from a really long time ago

    } else { // There are leap years every century

        jdn = (day + (153*m+2)/5 + 365*y + y/4 - 32045); // Determines time in Julian days from a really long time ago
    }

    jdn -= 2299161; // offset epoch to October 15, 1582
    jdn *= 86400; // Turn gregorian days into seconds
    jdn += ((hours*3600) + (minutes*60) + seconds); // and on the time of day to the timestamp

    return jdn;
}




//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//                  Beginning of processConfig function
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

int processConfig(char infile_name[QUAD_WORD], double *gregPtr, char (*dateInformation)[HALF_NAME]){
	/* Reads the configuration file and stores the day's information into a global array to be printed out in the main file */

	char buf[HALF_NAME];
    char information[HALF_NAME];
    char temp[HALF_NAME];

    int day = 0, month = 0, year = 0, hour = 0, minute = 0, length = 0;
    int i = 0;

	FILE *infile;

	if ((infile = fopen(infile_name, "r+b")) == NULL)     //     checking if infile exists, returns error if doesn't exist
	{ fprintf(stderr, "Cannot open holiday input file.\n"); return 1; }
	
	fgets(buf, HALF_NAME, infile);fgets(buf, HALF_NAME, infile); // skip the first 2 lines of the file

	while(!feof(infile)){ // Until end of file reached

		fgets(buf, HALF_NAME, infile); // Get next line
        sscanf(buf, "%d-%d-%dT%d:%d\t%d\t%[^\r\n]", &year, &month, &day, &hour, &minute, &length, information); // Split the data into their respective variables
        // printf("_%f_\n", *gregPtr);
        *(gregPtr + i) = getGregDate(day, month, year, 0, 0, 0);
        strcpy(*(dateInformation + i), information);
        i++;
	}

	return 0;
}



//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//                  Beginning of convertGreg function
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

void convertGreg(double original_time_stamp, int *day, int *month, int *year) {
	// Given a greg time, determine the calendar date and fill in the addressed variables

    int n_month = 0;
    int n_month_day = 0;
    int one_Centuries;
    const int days_in_fourCenturies = ((400*365) + 97), days_in_oneCenturies = (100*365 + 24);
    int four_years = 0, n_four_years = (4*365 + 1), fourCenturies;
    int year_days = 0;
    // double time_stamp = original_time_stamp + (zone_hour*3600) + (zone_quarter_hour*60);
    double time_stamp = original_time_stamp;

    double days = 0;
    double n_fourCenturies, oneCenturies, quad_year, one_year;
    double four_cent_days_remain, dec_four_years = 0;

    double greg_epoch = 6287; // number of days between Oct 15, 1582 to Dec 31, 1599

  
    days = time_stamp/86400;

    n_fourCenturies = (days - greg_epoch) / days_in_fourCenturies; fourCenturies = floor(n_fourCenturies) * 400 + 1600;
    four_cent_days_remain = (n_fourCenturies - floor(n_fourCenturies)) * days_in_fourCenturies;

    oneCenturies = floor((four_cent_days_remain - 1) / days_in_oneCenturies);
    if(oneCenturies < 0) { oneCenturies = 0; }

    one_Centuries = oneCenturies;
    if(fourCenturies >= 1600){
        if(one_Centuries == 0){ // no leap days on first century
            quad_year = (four_cent_days_remain / n_four_years);
            quad_year = floor(round(quad_year*10000000000)/10000000000)*4; //round to the 10th decimal
            dec_four_years = days - greg_epoch - (floor(n_fourCenturies) * days_in_fourCenturies) - ((quad_year / 4) * n_four_years);
        }
        else{ // leap days on on consecutive three centuries
            quad_year = ((four_cent_days_remain + oneCenturies) / n_four_years);
            quad_year = floor(round(quad_year*10000000000)/10000000000)*4; //round to the 10th decimal
            dec_four_years = days - greg_epoch - (floor(n_fourCenturies) * days_in_fourCenturies) - ((quad_year / 4) * n_four_years) + oneCenturies;
    }   }  

    // Calculate the number of years since
    one_year = floor(((floor(dec_four_years) - 1)/365));
    if(one_year<0) one_year = 0;

    if(quad_year >= 0) four_years = fourCenturies + quad_year + one_year;
    else four_years = fourCenturies;
    year_days = floor(dec_four_years) - (one_year*365);

//------------------------------------------------------------------------------
//                 ###############     leap year     ###############
//------------------------------------------------------------------------------
    if(one_year == 0 && (four_years % 100 != 0 || four_years % 400 == 0)){
        if(year_days <= 120){ // first 4 months
            if(year_days <= 59){ // Jan/Feb
                if(year_days <= 30){  n_month = 1; n_month_day = year_days; } // Jan
                else {                n_month = 2; n_month_day = year_days - 31; } // Feb
            }
            else { // Mar/Apr
                if(year_days <= 90){  n_month = 3; n_month_day=year_days - 60; } //Mar
                else {                n_month = 4; n_month_day=year_days - 91; } // Apr
            }
        }
        else if(year_days <= 243){ // middle 4 months
            if(year_days <= 181){ //  May/Jun
                if(year_days <= 151){ n_month = 5; n_month_day=year_days - 121; } // May
                else {                n_month = 6; n_month_day=year_days - 152; } // Jun
            }
            else{ // Jul/Aug
                if(year_days <= 212){ n_month = 7; n_month_day=year_days - 182; } // Jul
                else {                n_month = 8; n_month_day=year_days - 213; } //Aug
            }
        }
        else { // last 4 months
            if(year_days <= 304){ // Sep/Oct
                if(year_days <= 273){ n_month = 9; n_month_day=year_days - 244; } //Sep
                else{                 n_month = 10; n_month_day=year_days - 274; } //Oct
            }
            else { // Nov/Dec
                if(year_days <= 334){ n_month = 11; n_month_day=year_days - 305; } //Nov
                else {                n_month = 12; n_month_day=year_days - 335; } // Dec
    }   }    }

//------------------------------------------------------------------------------
    else { //     ###############     non-leap year     ###############
//------------------------------------------------------------------------------
        year_days--;
        if(year_days <= 119){ // first 4 months
            if(year_days <= 58){ // Jan/Feb
                if(year_days <= 30){  n_month = 1; n_month_day=year_days; } // Jan
                else {                n_month = 2; n_month_day=year_days - 31; } // Feb
            }
            else { // Mar/Apr
                if(year_days <= 89){  n_month = 3; n_month_day=year_days - 59; } // Mar
                else {                n_month = 4; n_month_day=year_days - 90; } // Apr
            }
        }
        else if(year_days <= 242){ // middle 4 months
            if(year_days <= 180){ //  May/Jun
                if(year_days <= 150){ n_month = 5; n_month_day=year_days - 120; } // May
                else {                n_month = 6; n_month_day=year_days - 151; } // Jun
            }
            else{ // Jul/Aug
                if(year_days <= 211){ n_month = 7; n_month_day=year_days - 181; } // Jul
                else {                n_month = 8; n_month_day=year_days - 212; } //Aug
            }
        }
        else { // last 4 months
            if(year_days <= 303){ // Sep/Oct
                if(year_days <= 272){ n_month = 9; n_month_day=year_days - 243;  } // Sep
                else{                 n_month = 10; n_month_day=year_days - 273; } // Oct
            }
            else { // Nov/Dec
                if(year_days <= 333){ n_month = 11; n_month_day=year_days - 304; } // Nov
                else {                n_month = 12; n_month_day=year_days - 334; } // Dec
    }   }    }

    n_month_day++;

    // printf("%d\n", four_years);
    *day = n_month_day; *month = n_month; *year = four_years;

    return;
}
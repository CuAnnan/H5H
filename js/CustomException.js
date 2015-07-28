"use strict";
function CustomException(name, msg)
{
	var err = new Error(msg);
	err.name = name;
	if(!err.message) err.message = msg;
	return err;
}
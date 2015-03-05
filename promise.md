```javascript

// Do our booking without promises..                                                                                   
bookFlight(function (value1) {                                                                      
  bookHotell(value1, function(value2) {                                                             
    bookCar(value2, function(value3) {                                                              
      // Do something with booked items                                                             
    });                                                                                             
  });                                                                                               
});                                                                                                 
                                                                                                    
//                                                                                                  
// If all the above functions would work it's not that bad..                                        
// but what if we need to perform 42 calls, we would get an indentation                             
// level of 84 blanks, which gets very hard to read and debug, not to                               
// mention if we want to catch and recover from errors in this process                              
                                                                                                    
// If we instead would ensure that our booking functions would return promises                      
// A promise uses .resolve when happy and .reject when an error occurs                              
// so in our case a sucessful booking would return p.resolve(result) and an.                        
// unsuccesful booking would return promise.reject(err);                                            
// Armed with our promised booking we could easily replace the above code with                      
//                                                                                                  
                                                                                                    
// We fire off all our function calls, they will eventually return                                  
var promisedFlight = bookFlight(someParamForFlight);                                                
var promisedeHotell = bookHotell(someParamForHotell);                                               
var promisedCar = bookCar(someParamForCar);                                                         
                                                                                                    
promisedFlight                                                                                      
.then(promisedHotell)                                                                               
.then(promisedCar){function(value3){                                                                
  // Do something with booked items, e.g. pay..                                                     
})                                                                                                  
.catch(function(err){                                                                               
  // Handle any error thrown by flight, car or hotell!                                              
}); 

```

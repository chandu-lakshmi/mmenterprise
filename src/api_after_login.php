<?php
//Dashboard Page
$app->get('/dashboard',function ($request, $response, $args) use ($app) {
    //Arguments
    $args       = commonArgs($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    // Render dashboard view
    return $this->renderer->render($response, 'dashboard.phtml', $args);
});

$app->get("/logout", function ($request, $response, $args) { 
	session_destroy(); 
	//Arguments
	$args       = commonArgs($this->settings);
	return $response->withRedirect($args['APP_DOMAIN']);
}); 

//Post job Page
$app->get('/postJob',function ($request, $response, $args) use ($app) {
	//Arguments
    $args       = commonArgs($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    // Render dashboard view
    return $this->renderer->render($response, 'dashboard.phtml', $args);
});


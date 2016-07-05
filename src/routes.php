<?php
// Routes

/*$app->get('/[{name}]', function ($request, $response, $args) {
    // Sample log message
    //$this->logger->info("Slim-Skeleton '/' route");

    $args['API_DOMAIN'] = $this->settings['APP']['API_DOMAIN'];

    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});*/


$app->get('/', function ($request, $response, $args) {
    // Sample log message
    //$this->logger->info("Slim-Skeleton '/' route");

    $args['API_DOMAIN'] = $this->settings['APP']['API_DOMAIN'];


    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});




$app->post('/login', function ($request, $response, $args) {
    // Sample log message
    //$this->logger->info("Slim-Skeleton '/' route");

    print_r($_POST);

    //$args['API_DOMAIN'] = $this->settings['APP']['API_DOMAIN'];

    echo "<br>in loginme route";


    // Render index view
    //return $this->renderer->render($response, 'index.phtml', $args);
});

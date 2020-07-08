<?php

    header('Content-Type: application/json');

    //code to send score to database
    //currently only handles weedle game. Will need expanding once it works

    $aResult = array();

    $aResult['error'] = 'before';


    if( isset($_POST['player_score']) && isset($_POST['player_name']) && isset($_POST['player_email']) )
    {

        //mySQL connection variables
        $server= "db5000464691.hosting-data.io"; /* Address of the IONOS database server */
        $user= "dbu26018"; /* Database User Name */
        $password= "R@ichu4321"; /* Password */
        $database= "dbs445094"; /* Name of the Database */
        $table= "tbGameScores"; /* Name of the table */
        $dsn = "mysql:host=".$server.";dbname=".$database;

        /* Connect to the MySQL Server */
        $pdo = new PDO($dsn, $user, $password);

        //get trainer details from logged-in users
        $player_email = $_POST['player_email'];
        $player_name = $_POST['player_name'];
        $player_score = $_POST['player_score'];

        //Write the entry data to the database
        $stm = 'INSERT INTO tbGameScores (tbGameScores.Trainer_Name, tbGameScores.Trainer_Email, tbGameScores.Weedle_Score) 
            VALUES ("'.$player_name.'", "'.$player_email.'", "'.$player_score.'")';
        $pdo->exec($stm);

        $aResult['error'] = 'None';
    }

    echo json_encode($aResult);

?>
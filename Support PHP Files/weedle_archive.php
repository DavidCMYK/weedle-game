<?php
    echo '<!doctype html> 
    <html lang="en"> 
    <head> 
        <meta charset="UTF-8" />
        <title>Weedle Run</title>
        <script src="//cdn.jsdelivr.net/npm/phaser@3.11.0/dist/phaser.js"></script>
        <script type="text/javascript" src="http://gopins.co.uk/games/weedlegame/weedlegame1_2.js"></script>
        <style type="text/css">
            body {
                margin: 0;
            }
        </style>
    </head>
    <body>';

    //mySQL connection variables
    $server= "db5000464691.hosting-data.io"; /* Address of the IONOS database server */
    $user= "dbu26018"; /* Database User Name */
    $password= "R@ichu4321"; /* Password */
    $database= "dbs445094"; /* Name of the Database */
    $table= "tbTrainers"; /* Name of the table */
    $dsn = "mysql:host=".$server.";dbname=".$database;

    /* Connect to the MySQL Server */
    $pdo = new PDO($dsn, $user, $password);

    $player_score = $_POST['score_field'];
    $player_name = $_POST['name_field'];
    $player_email = $_POST['email_field'];

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        //Write the entry data to the database
        $stm = 'INSERT INTO tbGameScores (tbGameScores.Trainer_Name, tbGameScores.Trainer_Email, tbGameScores.Weedle_Score) 
    VALUES ("'.$player_name.'", "'.$player_email.'", "'.$player_score.'")';
        $pdo->exec($stm);
    }

    //Get the scoreboard
    $stm = $pdo->query('SELECT * FROM `vWeedleScores`');
    
    //fill an array with all entries
    while($row=$stm->fetch(PDO::FETCH_ASSOC)) {
        $score_array[$row['Trainer_Name']]=$row;
    }
    
    echo '<div id="game_div">';
    echo '</div>
    <div id="form">';

    echo '<form method="post" action="'.htmlspecialchars($_SERVER["REQUEST_URI"]).'" enctype="multipart/form-data">';

    //display the player's score
    echo '<input type="hidden" id="score_field" name="score_field" placeholder="0">';

    //display the player's name
    echo 'Trainer Name: <input type="text" id="name_field" name="name_field" value="'.$player_name.'"> ';

    //display the contact email field
    echo 'Email: <input type="text" id="email_field" name="email_field" value="'.$player_email.'"> ';

    //Display the submit button
    echo '<input type="submit" id="go_button" value="Submit Score"><br>';

    echo '</form>
    </div>
    <br>
    <div id="score_board">';

    //Table to display results
    echo '<table id="score_board">';
    echo '<colgroup><col class="Trainer_Name"><col class="Score"></colgroup>';
    echo '<thead>';
    echo '<tr class="header">';
    echo '<th>Trainer</th><th>Score</th>';
    echo '</tr></thead>';
    foreach($score_array as $row) {
        echo '<tr>';
        echo '<td>'.$row['Trainer_Name'].'</td><td>'.$row['Score'].'</td>';
        echo '</tr>';
    }
    echo '</table>

    </div>

    </body>
    </html>
    </div>';
?>

<?php
/**
 * The template for displaying the weedle game page.
 */
$container_class = apply_filters( 'neve_container_class_filter', 'container', 'single-page' );

get_header("games");

?>
<div class="<?php echo esc_attr( $container_class ); ?> single-page-container">
	<div class="row">
		<?php do_action( 'neve_do_sidebar', 'single-page', 'left' ); ?>
		<div class="nv-single-page-wrap col">
			<?php
			do_action( 'neve_before_page_header' );
			do_action( 'neve_page_header', 'single-page' );
			do_action( 'neve_before_content', 'single-page' );
			if ( have_posts() ) {
				while ( have_posts() ) {
					the_post();
					get_template_part( 'template-parts/content', 'page' );
				}
			} else {
				get_template_part( 'template-parts/content', 'none' );
			}
            do_action( 'neve_after_content', 'single-page' );
			?>

            <?php

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
            ?>


            <?php
                if (is_user_logged_in())
                {
                    global $current_user;
                    //wp_get_current_user();
                    get_currentuserinfo();
                    if ($player_email == '') { $player_email = $current_user->user_email; }
                    if ($player_name == '') { $player_name =  $current_user->display_name; }
                    echo '<div id="game_div" style="height: 800px">
                    <script type="text/javascript" src="//gopins.co.uk/weedlegame/weedlegame.js"></script>
                    </div>';

                    echo '<br><div id="form">';
                    echo '<form method="post" action="'.htmlspecialchars($_SERVER["REQUEST_URI"]).'" enctype="multipart/form-data">';
    
                    //hold the player's score in a hidden field
                    echo '<input type="hidden" id="score_field" name="score_field" placeholder="0">';
    
                    //display the player's name
                    echo 'Trainer Name: <input type="text" id="name_field" name="name_field" value="'.$player_name.'"> ';
    
                    //display the contact email field
                    echo 'Email: <input type="text" id="email_field" name="email_field" value="'.$player_email.'"> ';
                    
                    //Display the submit button
                    echo '<input type="submit" id="go_button" value="Submit Score"><br>';
                    echo '</form>
                    </div>';
                }
                else{
                    echo '<a href="https://gopins.co.uk/login">Login</a> or <a href="https://gopins.co.uk/registration">register</a> to play games and enter challenges<br>';
                }
            ?>

            <br>
            <div id="score_board">
                <?php

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
                    echo '</table>';
                ?>
            </div>
		</div>
		<?php do_action( 'neve_do_sidebar', 'single-page', 'right' ); ?>
	</div>
</div>
<?php get_footer(); ?>

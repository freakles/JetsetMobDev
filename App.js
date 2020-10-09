import React, { useState } from 'react';
import { StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("test.db");  // Create a Database object and open the connection with the database 

function Items({ done: doneHeading, onPressItem}) {
  const [items, setItems] = React.useState([]);   // we use items to store information (array)


React.useEffect(() => {
  db.transaction(tx => {      // a TRANSACTION object is passed to callback function as parameter to execute the SQL statement
    tx.executeSql(            // executeSQL is used to query on the database
      `SELECT * FROM items where done = ?;`,
      [doneHeading ? 1:0],
      (_, { rows: { _array } }) => setItems(_array)     // this is a ResultSet object, and _array value is what we need since it returns an array of rows invoked by the query
    );
    console.log(items);    // Shows on console the database
  });
}, []);

const heading = doneHeading ? "It's Done!" : "To Do";

if(items === null || items.length === 0) {
  return null;
}

    //------------- Store the data provided -------------------
return(
  <View style = {styles.sectionContainer}>
    <Text style = {styles.sectionHeading}> {heading} </Text>
    {items.map(({ id, done, value }) => (
      <TouchableOpacity
        key = { id }
        onPress = {() => onPressItem && onPressItem(id)}
        style = {{
          backgroundColor: done ? "#12c9c0" : "#e2e2e2",
          borderColor: "#fff",
          borderWidth: 1,
          padding: 8
        }}
      >
        <Text style = {{ color: done ? "#fff" : "#000" }}> {value} </Text>
      </TouchableOpacity>
    ))}
  </View>
);
      }

export default function App() {
  const [text, setText] = React.useState(null)
  const [forceUpdate, forceUpdateId] = useForceUpdate()

  //------------------------ Create the table -------------------------------
  React.useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        "CREATE TABLE if not exists items (id integer primary key not null, done int, value text);"
      );
    });
  }, []);

  const add = (text) => {
    // is text empty?
    if(text === null || text === "") {
      return false;
    }

    //------------------------ Insert data to the database -----------------
    db.transaction(
      tx => {
        tx.executeSql("INSERT INTO items (done, value) values (0, ?)", [text]);
        tx.executeSql("SELECT * FROM items", [], (_, {rows}) => 
        console.log(JSON.stringify(rows))     
        );
      },
      null,
      forceUpdate
    );
  }

  return(
    //--------------- Convert from To Do to Completed ------------------------
    <View style = {styles.container}>
      <Text style = {styles.heading}> React_SQLite App </Text>
      <View style = {styles.flexRow}>
        <TextInput
          onChangeText = {text => setText(text)}
          onSubmitEditing = {() => {
            add(text);
            setText(null);
          }}
          placeholder = "Things To Do Today"
          style = {styles.input}
          value = {text}
        />
      </View>
      <ScrollView style = {styles.listArea}> 
        <Items
          key = {`forceupdate-todo-${forceUpdateId}`}
          done = {false}
          onPressItem = {id =>
            db.transaction(
              tx => {
                tx.executeSql(`UPDATE items SET done = 1 WHERE id = ?;`, [id]);
              },
              null,
              forceUpdate
            )
          }
        />
        <Items
          done
          key = {`forceupdate-done-${forceUpdateId}`}
          onPressItem = {id =>
            db.transaction(
              tx => {
                tx.executeSql(`DELETE items FROM items WHERE id = ?;`, [id]);
              },
              null,
              forceUpdate
            )
          }
        />
      </ScrollView>
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

// ------------STYLES---------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: Constants.statusBarHeight
  },

  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },

  flexRow: {
    flexDirection: "row"
  },

  input: {
    borderColor: "#000",
    borderRadius: 5,
    borderWidth: 2,
    flex: 1,
    height: 50,
    margin: 16,
    padding: 10
  },

  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 20
  },

  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16
  },

  sectionHeading: {
    fontSize: 20,
    marginBottom: 10
  }
});

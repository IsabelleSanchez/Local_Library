#!/usr/bin/env node

/**
 * This script populates some test books, authors, genres, and book instances.
 */

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const mongoose = require("mongoose");
const Author = require("./models/author");
const Book = require("./models/book");
const BookInstance = require("./models/bookinstance");
const Genre = require("./models/genre");

const genres = [];
const authors = [];
const books = [];
const bookinstances = [];

const mongoose_uri = userArgs[0];

mongoose.connect(mongoose_uri);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

async function genreCreate(name) {
  const genre = new Genre({ name });
  await genre.save();
  genres.push(genre);
  console.log(`Added genre: ${name}`);
}

async function authorCreate(first_name, family_name, d_birth, d_death) {
  const authordetail = { first_name, family_name };
  if (d_birth != false) authordetail.date_of_birth = d_birth;
  if (d_death != false) authordetail.date_of_death = d_death;

  const author = new Author(authordetail);
  await author.save();
  authors.push(author);
  console.log(`Added author: ${first_name} ${family_name}`);
}

async function bookCreate(title, summary, isbn, author, genre) {
  const bookdetail = {
    title,
    summary,
    author,
    isbn,
  };
  if (genre != false) bookdetail.genre = genre;

  const book = new Book(bookdetail);
  await book.save();
  books.push(book);
  console.log(`Added book: ${title}`);
}

async function bookinstanceCreate(book, imprint, due_back, status) {
  const bookinstancedetail = {
    book,
    imprint,
  };
  if (due_back != false) bookinstancedetail.due_back = due_back;
  if (status != false) bookinstancedetail.status = status;

  const bookinstance = new BookInstance(bookinstancedetail);
  await bookinstance.save();
  bookinstances.push(bookinstance);
  console.log(`Added bookinstance: ${imprint}`);
}

async function createGenres() {
  console.log("Adding genres");
  await Promise.all([
    genreCreate("Fantasy"),
    genreCreate("Science Fiction"),
    genreCreate("French Poetry"),
    genreCreate("Drama"),
  ]);
}

async function createAuthors() {
  console.log("Adding authors");
  await Promise.all([
    authorCreate("Patrick", "Rothfuss", "1973-06-06", false),
    authorCreate("Ben", "Bova", "1932-11-8", false),
    authorCreate("Isaac", "Asimov", "1920-01-02", "1992-04-06"),
    authorCreate("Bob", "Dylan", "1941-05-24", false),
    authorCreate("Bill", "Bryson", "1951-12-08", false),
  ]);
}

async function createBooks() {
  console.log("Adding books");
  await Promise.all([
    bookCreate(
      "The Name of the Wind (The Kingkiller Chronicle, #1)",
      "I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.",
      "9781473211896",
      authors[0],
      [genres[0]]
    ),
    bookCreate(
      "The Wise Man's Fear (The Kingkiller Chronicle, #2)",
      "Picking up the tale of Kvothe Arliden's son, from the end of The Name of the Wind, we find him in innkeeper, named Kote, who played Lucan Lakkey's sale of ears and okay. Cirka and Tempi following the Lethani...",
      "9788401352023",
      authors[0],
      [genres[0]]
    ),
    bookCreate(
      "The Slow Regard of Silent Things (Kingkiller Chronicle)",
      "Deep below the University, there is a dark matter. It had been imprisoned, until a series of circumstances -- starting with two human words -- set it free. And that truth of the driving knowledge of Elodin, the Master Namer, there is a powerful, dangerous thing. The Slow Regard of Silent Things is the story of the subtle energy of the world, the knowledge of names. Auri is Elodin's student, and The Slow Regard of the Silent Things is her story...",
      "9780756411268",
      authors[0],
      [genres[0]]
    ),
    bookCreate(
      "Eon (Revelation Space)",
      "The first science fiction novel in Alastair reynold's epic space opera sequence. Humankind has finally encountered alien life, but the aliens, the Inhibitors, have fought interstellar wars on a scale that makes previous conflicts look like scuffles. They are spacefarers and voiders...",
      "978057508927",
      authors[1],
      [genres[1]]
    ),
  ]);
}

async function createBookInstances() {
  console.log("Adding book instances");
  await Promise.all([
    bookinstanceCreate(books[0], "London Gollancz, 2014.", false, "Available"),
    bookinstanceCreate(
      books[1],
      "Gollancz, 2011.",
      new Date("2024-12-31"),
      "Loaned"
    ),
    bookinstanceCreate(books[2], "Gollancz, 2015.", false, false),
    bookinstanceCreate(
      books[3],
      "Gollancz SF, 1997.",
      false,
      "Reserved"
    ),
  ]);
}

async function populate() {
  await createGenres();
  await createAuthors();
  await createBooks();
  await createBookInstances();
}

populate()
  .catch((err) => {
    console.log("POPULATION FAILED with error: " + err);
    process.exit(1);
  })
  .then(() => {
    console.log("POPULATION COMPLETE");
    mongoose.connection.close();
  });

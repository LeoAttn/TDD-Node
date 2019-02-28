import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import chaiNock from 'chai-nock'
import chaiAsPromised from 'chai-as-promised'
import path from 'path'
import nock from 'nock'

import server from '../main/server'
import resetDatabase from '../main/utils/resetDatabase'

chai.use(chaiHttp)
chai.use(chaiNock)
chai.use(chaiAsPromised)

// tout les packages et fonction nescessaire au test sont importé ici, bon courage
const pathBooks = path.join(__dirname, '../main/data/books.json')

const emptyBookstore = {
  books: []
}
const bookId = '0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9'
const BookstoreWithBook = {
  books: [{
    id: bookId,
    title: 'Coco raconte Channel 2',
    years: 1990,
    pages: 400
  }]
}
const book = {
  title: 'Coco raconte Channel 42',
  years: 1990,
  pages: 400
}
const bookUpdate = {
  title: 'Coco raconte Channel 42 Updated',
  years: 1990,
  pages: 400
}

const successfullyAdded = 'book successfully added'
const successfullyUpdated = 'book successfully updated'
const successfullyDeleted = 'book successfully deleted'
const errorFetching = 'error fetching books'
const errorAdding = 'error adding the book'
const errorUpdating = 'error updating the book'
const errorDeleting = 'error deleting the book'


// fait les Tests d'integration en premier
describe('Test intégration (Empty database)', () => {
  beforeEach(() => {
    resetDatabase(pathBooks, emptyBookstore)
  })

  it('should return empty database', done => {
    chai
      .request(server)
      .get('/book')
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.books).to.be.a('array')
        expect(res.body.books.length).to.equal(0)
        done()
      })
  })

  it('should add book in database', done => {
    chai
      .request(server)
      .post('/book')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(book)
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(successfullyAdded)
        done()
      })
  })

})

describe('Test intégration (Mocked database)', () => {
  beforeEach(() => {
    resetDatabase(pathBooks, BookstoreWithBook)
  })

  it('should update a book', done => {
    chai
      .request(server)
      .put(`/book/${bookId}`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(bookUpdate)
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(successfullyUpdated)
        done()
      })
  })

  it('should delete a book', done => {
    chai
      .request(server)
      .delete(`/book/${bookId}`)
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(successfullyDeleted)
        done()
      })
  })

  it('should get a book', done => {
    chai
      .request(server)
      .get(`/book/${bookId}`)
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body.message).to.equal('book fetched')
        expect(res.body.book).to.be.a('object')
        expect(res.body.book.title).to.be.a('string')
        expect(res.body.book.title).to.equal(BookstoreWithBook.books[0].title)
        expect(res.body.book.years).to.be.a('number')
        expect(res.body.book.years).to.equal(BookstoreWithBook.books[0].years)
        expect(res.body.book.pages).to.be.a('number')
        expect(res.body.book.pages).to.equal(BookstoreWithBook.books[0].pages)
        done()
      })
  })
})

describe('Test unitaire (simulation de réponse ok)', () => {
  // beforeEach(()=>{
  //   nock.disableNetConnect();
  //   nock.enableNetConnect(/^(127\.0\.0\.1|localhost)/);
  // });
  afterEach(() => {
    nock.cleanAll()
    // nock.restore()
  })

  it('should get all books', done => {
    nock('http://localhost:8080')
      .get('/book')
      .reply(200, BookstoreWithBook)

    chai
      .request('http://localhost:8080')
      .get('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.books).to.be.a('array')
        done()
      })
  })

  it('should add a book', done => {
    nock('http://localhost:8080')
      .post('/book')
      .reply(200, {
        message: successfullyAdded
      })

    chai
      .request('http://localhost:8080')
      .post('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(successfullyAdded)
        done()
      })
  })

  it('should update a book', done => {
    nock('http://localhost:8080')
      .put(`/book/${bookId}`)
      .reply(200, {
        message: successfullyUpdated
      })

    chai
      .request('http://localhost:8080')
      .put(`/book/${bookId}`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(bookUpdate)
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(successfullyUpdated)
        done()
      })
  })

  it('should delete a book', done => {
    nock('http://localhost:8080')
      .delete(`/book/${bookId}`)
      .reply(200, {
        message: successfullyDeleted
      })

    chai
      .request('http://localhost:8080')
      .delete(`/book/${bookId}`)
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(successfullyDeleted)
        done()
      })
  })
})

describe('Test unitaire (simulation de mauvaise réponse)', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('should have an error to get all books', done => {
    nock('http://localhost:8080')
      .get('/book')
      .reply(400, {
        message: errorFetching
      })

    chai
      .request('http://localhost:8080')
      .get('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(errorFetching)
        done()
      })
  })

  it('should have an error to add a book', done => {
    nock('http://localhost:8080')
      .post('/book')
      .reply(400, {
        message: errorAdding
      })

    chai
      .request('http://localhost:8080')
      .post('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(errorAdding)
        done()
      })
  })

  it('should have an error to update a book', done => {
    nock('http://localhost:8080')
      .put(`/book/${bookId}`)
      .reply(400, {
        message: errorUpdating
      })

    chai
      .request('http://localhost:8080')
      .put(`/book/${bookId}`)
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(errorUpdating)
        done()
      })
  })

  it('should have an error to delete a book', done => {
    nock('http://localhost:8080')
      .delete(`/book/${bookId}`)
      .reply(400, {
        message: errorDeleting
      })

    chai
      .request('http://localhost:8080')
      .delete(`/book/${bookId}`)
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal(errorDeleting)
        done()
      })
  })
})

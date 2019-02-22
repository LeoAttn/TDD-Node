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
const emptyBooks = {
  books: []
}
const oneBook = {
  books: [{
    id: '0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9',
    title: 'Coco raconte Channel 2',
    years: 1990,
    pages: 400
  }]
}


// fait les Tests d'integration en premier
describe('Test intégration (Empty database)', () => {
  beforeEach(() => {
    resetDatabase(path.join(__dirname, '../main/data/books.json'), emptyBooks)
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
      .send({
        title: 'Coco raconte Channel 2',
        years: 1990,
        pages: 400
      })
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('book successfully added')
        done()
      })
  })

})

describe('Test intégration (Mocked database)', () => {
  beforeEach(() => {
    resetDatabase(path.join(__dirname, '../main/data/books.json'), oneBook)
  })

  it('should update a book', done => {
    chai
      .request(server)
      .put('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        title: 'Coco raconte Channel 42',
        years: 1990,
        pages: 480
      })
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('book successfully updated')
        done()
      })
  })

  it('should delete a book', done => {
    chai
      .request(server)
      .delete('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('book successfully deleted')
        done()
      })
  })

  it('should get a book', done => {
    chai
      .request(server)
      .get('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body.message).to.equal('book fetched')
        expect(res.body.book).to.be.a('object')
        expect(res.body.book.title).to.be.a('string')
        expect(res.body.book.title).to.equal(oneBook.books[0].title)
        expect(res.body.book.years).to.be.a('number')
        expect(res.body.book.years).to.equal(oneBook.books[0].years)
        expect(res.body.book.pages).to.be.a('number')
        expect(res.body.book.pages).to.equal(oneBook.books[0].pages)
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
      .reply(200, oneBook)

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
        message: 'book successfully added'
      })

    chai
      .request('http://localhost:8080')
      .post('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('book successfully added')
        done()
      })
  })

  it('should update a book', done => {
    nock('http://localhost:8080')
      .put('/book')
      .reply(200, {
        message: 'book successfully updated'
      })

    chai
      .request('http://localhost:8080')
      .put('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('book successfully updated')
        done()
      })
  })

  it('should delete a book', done => {
    nock('http://localhost:8080')
      .delete('/book')
      .reply(200, {
        message: 'book successfully deleted'
      })

    chai
      .request('http://localhost:8080')
      .delete('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('book successfully deleted')
        done()
      })
  })
})

describe('Test unitaire (simulation de mauvaise réponse)', () => {
  // beforeEach(()=>{
  //   nock.disableNetConnect();
  //   nock.enableNetConnect(/^(127\.0\.0\.1|localhost)/);
  // });
  afterEach(() => {
    nock.cleanAll()
    // nock.restore()
  })

  it('should have an error to get all books', done => {
    nock('http://localhost:8080')
      .get('/book')
      .reply(400, {
        message: 'error fetching books'
      })

    chai
      .request('http://localhost:8080')
      .get('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('error fetching books')
        done()
      })
  })

  it('should have an error to add a book', done => {
    nock('http://localhost:8080')
      .post('/book')
      .reply(400, {
        message: 'error adding the book'
      })

    chai
      .request('http://localhost:8080')
      .post('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('error adding the book')
        done()
      })
  })

  it('should have an error to update a book', done => {
    nock('http://localhost:8080')
      .put('/book')
      .reply(400, {
        message: 'error updating the book'
      })

    chai
      .request('http://localhost:8080')
      .put('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('error updating the book')
        done()
      })
  })

  it('should have an error to delete a book', done => {
    nock('http://localhost:8080')
      .delete('/book')
      .reply(400, {
        message: 'error deleting the book'
      })

    chai
      .request('http://localhost:8080')
      .delete('/book')
      .end((err, res) => {
        if (err) console.log(err)
        console.log(res.body)
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('error deleting the book')
        done()
      })
  })
})

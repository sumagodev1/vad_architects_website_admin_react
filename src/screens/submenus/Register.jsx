////not in use
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
   
    console.log('Name:', name, 'Email:', email, 'Password:', password);
    
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4">Register</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-light border-0"
                  />
                </Form.Group>

                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-light border-0"
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-light border-0"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-4 py-2">
                  Register
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
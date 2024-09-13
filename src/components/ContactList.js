import React, { useState } from 'react';

const ContactList = ({ contacts, onSelectReceiver }) => {
  return (
    <div>
      <h3>Contacts</h3>
      <ul>
        {contacts.map((contact) => (
          <li key={contact._id} onClick={() => onSelectReceiver(contact._id)}>
            {contact.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;

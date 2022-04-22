For developers
==============
Clone the repository.

.. code-block:: console

    git clone https://github.com/DAM-Project/dam-app-django
    cd dam-app-django/


.. _installation:

Installation
------------
.. code-block:: console

    pip install -r requirements.txt


.. _installation:

Installation
------------

To use DAM App, :

.. code-block:: console

   (.venv) $ pip install lumache

Creating recipes
----------------

To retrieve a list of random ingredients,
you can use the ``lumache.get_random_ingredients()`` function:

.. autofunction:: lumache.get_random_ingredients

The ``kind`` parameter should be either ``"meat"``, ``"fish"``,
or ``"veggies"``. Otherwise, :py:func:`lumache.get_random_ingredients`
will raise an exception.

.. autoexception:: lumache.InvalidKindError

For example:

>>> import lumache
>>> lumache.get_random_ingredients()
['shells', 'gorgonzola', 'parsley']
